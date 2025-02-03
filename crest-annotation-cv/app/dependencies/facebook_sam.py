import logging
import hydra

from segment_anything import sam_model_registry
from sam2.build_sam import build_sam2

from app.environment import env


# see https://github.com/facebookresearch/sam2/issues/81
hydra.core.global_hydra.GlobalHydra.instance().clear()
hydra.initialize_config_module("models", version_base="1.2")


# shared SAM model
sam = None
sam2 = None


def get_sam_model():
    global sam

    if sam is None:
        # TODO: select checkpoint from frontend
        # provide sam model when needed
        sam = sam_model_registry[env.sam_model_type](checkpoint=env.sam_checkpoint)

        if env.sam_device:
            logging.info(f"SAM device: {env.sam_device}")
            # if no device is specified leave on CPU
            sam.to(device=env.sam_device)

    return sam


def get_sam2_model():
    global sam2

    if sam2 is None:
        # TODO: select checkpoint from frontend
        # provide sam model when needed
        sam2 = build_sam2(env.sam2_config, env.sam2_checkpoint)

    return sam2
