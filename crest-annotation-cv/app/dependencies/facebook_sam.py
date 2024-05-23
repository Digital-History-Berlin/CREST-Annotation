import logging

from segment_anything import sam_model_registry

from app.environment import env


# shared SAM model
sam = None


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
