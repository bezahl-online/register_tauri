# register

Nvidia Fehler
Failed to create GBM buffer of size 1920x1080: Invalid argument
src/nv_gbm.c:99: GBM-DRV error (nv_gbm_bo_create): DRM_IOCTL_NVIDIA_GEM_ALLOC_NVKMS_MEMORY failed (ret=-1)

umgehen mit:
__NV_PRIME_RENDER_OFFLOAD=1 ./register