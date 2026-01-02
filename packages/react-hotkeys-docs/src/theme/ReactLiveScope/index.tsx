import React from "react";
import ReactLiveScope from "@theme-original/ReactLiveScope";
import * as RH from "@selokhq/react-hotkeys";

const ExtendedScope = {
  ...ReactLiveScope,
  ...RH,
  React,
};

export default ExtendedScope;
