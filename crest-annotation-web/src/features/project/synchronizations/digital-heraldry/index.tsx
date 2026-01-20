import React, { useEffect, useState } from "react";
import { Divider, Stack, Tab, Tabs, TextField } from "@mui/material";
import PullQuery from "./PullQuery";
import PushQuery from "./PushQuery";
import { defaultEndpoint, defaultPullQuery, defaultPushQuery } from "./queries";

interface SyncConfig {
  endpoint: string;
  pull_query: string;
  push_query: string;
}

const defaultConfig: SyncConfig = {
  endpoint: defaultEndpoint,
  pull_query: defaultPullQuery,
  push_query: defaultPushQuery,
};

interface IProps {
  value?: string;
  onChange: (config: string) => void;
}

const DigitalHeraldryConfig = ({ value, onChange }: IProps) => {
  const [config, setConfig] = useState<SyncConfig>();
  const [tab, setTab] = useState("pull");

  useEffect(
    () => {
      if (!value) onChange(JSON.stringify(defaultConfig));
      else setConfig(JSON.parse(value));
    },
    // update internal state only when project changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value]
  );

  const handleChange = (change: Partial<SyncConfig>) =>
    onChange(JSON.stringify({ ...config, ...change }));

  return (
    <>
      <Stack padding={2} spacing={1}>
        <TextField
          label="SPARQL endpoint"
          variant="filled"
          value={config?.endpoint || ""}
          onChange={(e) => handleChange({ endpoint: e.target.value })}
          placeholder="http://localhost:8889/sparql"
        />
      </Stack>
      <Divider />
      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab label="Pull" value="pull" />
        <Tab label="Push" value="push" />
      </Tabs>
      <Divider />
      {tab === "pull" && (
        <PullQuery
          query={config?.pull_query}
          onChange={(pull_query) => handleChange({ pull_query })}
        />
      )}
      {tab === "push" && (
        <PushQuery
          query={config?.push_query}
          onChange={(push_query) => handleChange({ push_query })}
        />
      )}
    </>
  );
};

const synchronization = {
  component: DigitalHeraldryConfig,
  name: "Digital Heraldry",
  description:
    "Synchronize Annotations with the Digital Heraldry Ontology via SPARQL.",
};

export default synchronization;
