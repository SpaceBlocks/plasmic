import {
  PlasmicComponent,
  PlasmicRootProvider,
} from "@plasmicapp/loader-react";
import React from "react";
import { PLASMIC } from "./init-plasmic";

function Schedule() {
  const [loading, setLoading] = React.useState(false);
  const [variation, setVariation] = React.useState({});
  const getVariation = async () => {
    const activeVariation = await PLASMIC.getActiveVariation({
      traits: {
        time: "2200-01-01T00:00:00.000Z",
      },
    });
    setVariation(activeVariation);
    setLoading(false);
  };
  React.useEffect(() => {
    getVariation();
  }, []);
  if (loading) {
    return <p> Loading... </p>;
  }
  return (
    <PlasmicRootProvider loader={PLASMIC} variation={variation}>
      <PlasmicComponent component="HomePage" />
    </PlasmicRootProvider>
  );
}

export default Schedule;
