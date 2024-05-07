import { cvGet, cvPrepare } from "../../../../../api/cvApi";
import { MaskShape } from "../../../components/shapes/Mask";
import { operationBegin } from "../../../slice/operation";
import { ShapeType } from "../../../types/shapes";
import { Tool, ToolStatus } from "../../../types/toolbox";
import { createLoaderThunk } from "../../async-tool";
import {
  createActivateThunk,
  createConfigureThunk,
  createLabelThunk,
} from "../../custom-tool";
import { CvBackendConfig, CvToolInfo, CvToolOperation } from "../types";

interface OperationPayload {
  backend: CvBackendConfig;
  algorithm: string;
}

const toMaskShape = (json: { mask: number[][] }): MaskShape => ({
  type: ShapeType.Mask,
  mask: json.mask,
  width: json.mask[0].length,
  height: json.mask.length,
  dx: 0,
  dy: 0,
  preview: true,
});

const prepare = createLoaderThunk<CvToolInfo>(
  { tool: Tool.Cv, name: "Waiting for backend..." },
  async ({ info, config, image }, { dispatch }, { configure }) => {
    console.log("Preparing crest-detection...");

    if (!info.backend || !info.algorithm)
      throw new Error("Tool is not configured properly");

    // TODO: provide configuration and update on return
    await cvPrepare(info.backend.url, info.algorithm, { url: image });
    const response = await cvGet(
      info.backend.url,
      info.algorithm,
      "bounding-boxes"
    );

    const boundingBoxes = await response.json();

    // initialization successful
    configure({ status: ToolStatus.Ready, config });

    console.log(boundingBoxes);

    // proceed with labeling operation
    dispatch(
      operationBegin({
        type: "tool/cv",
        state: { tool: Tool.Cv, boundingBoxes },
      })
    );
  }
);

export const activate = createActivateThunk<CvToolInfo>(
  { tool: Tool.Cv },
  (info, thunkApi) => prepare({ info, config: info.config }, thunkApi)
);

export const configure = createConfigureThunk<CvToolInfo>(
  { tool: Tool.Cv },
  (info, config, thunkApi) => prepare({ info, config }, thunkApi)
);

export const label = createLabelThunk<CvToolOperation>({
  operation: "tool/cv",
  select: (operation) => ({
    ...(operation.state.shape as MaskShape),
    // disable preview mode
    preview: false,
  }),
});
