import React from "react";

export const Configuration = () => {
  /*
  const dispatch = useAppDispatch();

  const config = useAppSelector((state) => state.configs[Tool.Segment]);
  const activeTool = useAppSelector(selectActiveTool);

  const updateConfig = useCallback(
    (config: Partial<SegmentConfig>) => {
      dispatch(updateToolConfig({ tool: Tool.Segment, config }));
    },
    [dispatch]
  );

  useEffect(
    () => updateConfig({ state: undefined }),
    [updateConfig, config.backend]
  );

  // fetch available algorithms when backend is specified
  const validateBackend = () => {
    if (config.backend)
      info(config.backend)
        .then((response) => response.json())
        .then((data) => {
          updateConfig({ state: true, algorithms: data.algorithms });
          console.log("Backend available");
        })
        .catch((e) => {
          updateConfig({ state: false, algorithms: undefined });
          console.log(e);
        });
  };

  const applyChanges = useCallback(() => {
    // apply configuration to active tool by reloading
        // @ts-expect-error dispatch has incorrect type
    dispatch(activateTool({ tool: Tool.Segment }));
  }, [dispatch]);

  return (
    <Stack padding={2} spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          fullWidth
          variant="filled"
          label="Backend"
          value={config.backend || ""}
          onChange={(e) =>
            dispatch(
              updateToolConfig({
                tool: Tool.Segment,
                config: { backend: e.target.value },
              })
            )
          }
        />
        <IconButton onClick={validateBackend}>
          <CheckIcon />
        </IconButton>
      </Stack>
      {config.state === true && (
        <Stack direction="row" alignItems="center" gap={1}>
          <ValidIcon color="success" />
          <Typography color="success">Backend available</Typography>
        </Stack>
      )}
      {config.state === false && (
        <Stack direction="row" alignItems="center" gap={1}>
          <InvalidIcon color="error" />
          <Typography color="error">Backend not responding properly</Typography>
        </Stack>
      )}

      {config.algorithms && (
        <>
          <Divider />
          <TextField
            fullWidth
            variant="filled"
            label="Algorithm"
            select
            value={config.algorithm || ""}
            onChange={(e) =>
              dispatch(
                updateToolConfig({
                  tool: Tool.Segment,
                  config: { algorithm: e.target.value },
                })
              )
            }
          >
            {config.algorithms.map((algorithm) => (
              <MenuItem key={algorithm.id} value={algorithm.id}>
                {algorithm.name}
              </MenuItem>
            ))}
          </TextField>
          <Button onClick={applyChanges} variant="contained">
            Apply
          </Button>
        </>
      )}
    </Stack>
  );
  */
  return <></>;
};
