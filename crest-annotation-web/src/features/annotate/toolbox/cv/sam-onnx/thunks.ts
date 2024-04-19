import npyjs from "npyjs";
import { InferenceSession } from "onnxruntime-web";
import { v4 as uuidv4 } from "uuid";
import { modelData } from "./helpers/onnxModelAPI";
import { handleImageScale } from "./helpers/scaleHelper";
import { cvPrepare, cvRun } from "../../../../../api/cvApi";
import { Debouncer } from "../../../../../types/debounce";
import { MaskShape } from "../../../components/shapes/Mask";
import { addAnnotation } from "../../../slice/annotations";
import {
  isOperationOfType,
  operationBegin,
  operationCancel,
  operationComplete,
} from "../../../slice/operation";
import { patchToolState } from "../../../slice/toolbox";
import {
  GestureEvent,
  GestureIdentifier,
  GestureOverload,
} from "../../../types/events";
import { ShapeType } from "../../../types/shapes";
import {
  ToolGesturePayload,
  ToolLabelPayload,
  ToolThunk,
  ToolboxThunkApi,
} from "../../../types/thunks";
import { Tool, ToolStatus } from "../../../types/toolbox";
import {
  createActivateThunk,
  createConfigureThunk,
  createToolThunk,
} from "../../custom-tool";
import {
  CvBackendConfig,
  CvToolConfig,
  CvToolInfo,
  CvToolOperation,
} from "../types";
// TODO check if import works
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ort = require("onnxruntime-web");

const debouncer = new Debouncer(150);

interface OperationPayload {
  gesture: GestureEvent;
  backend: CvBackendConfig;
  algorithm: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toPreviewMask = (json: any) => ({
  type: ShapeType.Mask,
  mask: json.mask,
  width: json.mask[0].length,
  height: json.mask.length,
  dx: 0,
  dy: 0,
  preview: true,
});

const prepare = (info: CvToolInfo, { dispatch, getState }: ToolboxThunkApi) => {
  console.log("Preparing algorithm...");

  const {
    annotations: { project, object, image },
  } = getState();

  const { backend, algorithm } = info;
  if (!project || !object || !image || !backend || !algorithm) {
    console.log("Tool is not configured properly");
    // initialization not possible
    return dispatch(
      patchToolState({
        tool: Tool.Cv,
        patch: { status: ToolStatus.Failed },
      })
    );
  }

  // begin initializing the tool
  dispatch(
    patchToolState({
      tool: Tool.Cv,
      patch: { status: ToolStatus.Loading },
    })
  );

  const body = { url: image };
  cvPrepare(backend.url, algorithm, body)
    .then(async () => {
      console.log("Loading model...");
      const model = await InferenceSession.create(
        `${backend.url}/${algorithm}/onnx-quantized`
      );
      // store model in tool info
      dispatch(patchToolState({ tool: Tool.Cv, patch: { model } }));
    })
    .then(async () => {
      console.log("Loading embeddings...");
      const npLoader = new npyjs();
      const npArray = await npLoader.load(
        `${backend.url}/${algorithm}/embeddings`
      );
      const tensor = new ort.Tensor("float32", npArray.data, npArray.shape);
      // store tensor in tool info
      dispatch(patchToolState({ tool: Tool.Cv, patch: { tensor } }));
    })
    .then(async () => {
      console.log("Loading image...");
      const img = new Image();
      img.src = image;
      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img);
        img.width = width;
        img.height = height;
        dispatch(
          patchToolState({
            tool: Tool.Cv,
            patch: {
              status: ToolStatus.Ready,
              modelScale: {
                height: height, // original image height
                width: width, // original image width
                samScale: samScale, // scaling factor for image which has been resized to longest side 1024
              },
              img,
            },
          })
        );
      };
    })
    .catch((error) => {
      console.log("Tool initialization failed", error);
      dispatch(
        patchToolState({
          tool: Tool.Cv,
          patch: { status: ToolStatus.Ready },
        })
      );
    });
};

export const activate = createActivateThunk<CvToolInfo>(
  { tool: Tool.Cv },
  (info, thunkApi) => prepare(info, thunkApi)
);

export const configure = createConfigureThunk<CvToolInfo, CvToolConfig>(
  { tool: Tool.Cv },
  (info, config, thunkApi) => prepare(info, thunkApi)
);

const run: ToolThunk<OperationPayload> = (
  { gesture, backend, algorithm },
  { dispatch },
  { requestLabel, cancelLabel }
) => {
  const body = { cursor: gesture.transformed };
  cvRun(backend.url, algorithm, body)
    .then((response) => response.json())
    .then(toPreviewMask)
    .then((mask) => {
      dispatch(
        operationBegin({
          type: "tool/cv",
          state: {
            tool: Tool.Cv,
            interface: "generic-single-mask",
            shape: mask,
            labeling: true,
          },
          // register cleanup
          cancellation: cancelLabel,
          finalization: cancelLabel,
        })
      );

      // request a label for the shape
      requestLabel();
    });
};

// Convert the onnx model mask prediction to ImageData
function arrayToImageMask(input: any, width: number, height: number) {
  const mask: boolean[][] = [];

  for (let x = 0; x < width; x++) {
    mask[x] = [];
    for (let y = 0; y < height; y++) {
      // Threshold the onnx model mask prediction at 0.0
      // This is equivalent to thresholding the mask using predictor.model.mask_threshold
      // in python
      mask[x][y] = input[x * height + y] > 0.0;
    }
  }

  return mask;
}

export const gesture = createToolThunk<ToolGesturePayload, CvToolOperation>(
  { operation: "tool/cv" },
  ({ gesture }, operation, thunkApi, toolApi) => {
    const info = thunkApi.getInfo<CvToolInfo | undefined>();
    if (info === undefined) return;

    const { backend, algorithm, model, tensor, modelScale } =
      info as CvToolInfo & {
        model: InferenceSession;
        tensor: any;
        modelScale: { height: number; width: number; samScale: number };
      };
    // tool is not configured properly
    if (!backend || !algorithm) return;

    if (gesture.identifier === GestureIdentifier.Move) {
      if (!operation?.state.labeling) {
        thunkApi.dispatch(operationCancel(operation));
        debouncer.cancel();

        const clicks = [{ ...gesture.transformed, clickType: 1 }];
        try {
          if (!model || !tensor || !modelScale) return;
          else {
            // Preapre the model input in the correct format for SAM.
            // The modelData function is from onnxModelAPI.tsx.
            const feeds = modelData({
              clicks,
              tensor,
              modelScale,
            });
            if (feeds === undefined) return;

            const time = performance.now();
            console.log("Running model...");
            // Run the SAM ONNX model with the feeds returned from modelData()
            debouncer.debounce(async () => {
              const results = await model.run(feeds);
              const output = results[model.outputNames[0]];
              thunkApi.dispatch(
                operationBegin({
                  type: "tool/cv",
                  state: {
                    tool: Tool.Cv,
                    interface: "generic-single-mask",
                    shape: {
                      type: ShapeType.Mask,
                      mask: arrayToImageMask(
                        output.data,
                        output.dims[2],
                        output.dims[3]
                      ),
                      width: output.dims[3],
                      height: output.dims[2],
                      dx: 0,
                      dy: 0,
                      preview: true,
                    },
                  },
                })
              );
              const duration = performance.now() - time;
              console.log(`Inference done in ${duration} ms`);
            });
          }
        } catch (e) {
          console.log(e);
        }
      }
    }

    if (gesture.identifier === GestureIdentifier.Click) {
      if (operation?.state.labeling)
        // labeling process is can be canceled by clicking
        return thunkApi.dispatch(operationCancel(operation));
      if (gesture.overload === GestureOverload.Primary)
        // extract segmentation mask
        run({ gesture, backend, algorithm }, thunkApi, toolApi);
    }
  }
);

export const label: ToolThunk<ToolLabelPayload> = (
  { label },
  { dispatch, getState }
) => {
  if (label === undefined)
    // cancel operation if labeling was canceled
    return dispatch(operationCancel());

  const {
    operation: { current },
  } = getState();

  if (
    !isOperationOfType<CvToolOperation>(current, "tool/cv") ||
    current.state.interface !== "generic-single-mask"
  )
    // no shape to label
    return;

  const shape = {
    ...(current.state.shape as MaskShape),
    // disable preview mode
    preview: false,
  };

  dispatch(operationComplete(current));
  // create a new annotation with shape
  dispatch(
    addAnnotation({
      id: uuidv4(),
      shapes: [shape],
      label,
    })
  );
};
