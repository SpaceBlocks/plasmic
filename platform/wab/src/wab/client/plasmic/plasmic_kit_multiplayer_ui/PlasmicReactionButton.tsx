// @ts-nocheck
/* eslint-disable */
/* tslint:disable */
/* prettier-ignore-start */

/** @jsxRuntime classic */
/** @jsx createPlasmicElementProxy */
/** @jsxFrag React.Fragment */

// This class is auto-generated by Plasmic; please do not edit!
// Plasmic Project: BP7V3EkXPURJVwwMyWoHn
// Component: FOzDmFDbWm
import * as React from "react";

import * as p from "@plasmicapp/react-web";
import * as ph from "@plasmicapp/host";

import {
  hasVariant,
  classNames,
  wrapWithClassName,
  createPlasmicElementProxy,
  makeFragment,
  MultiChoiceArg,
  SingleBooleanChoiceArg,
  SingleChoiceArg,
  pick,
  omit,
  useTrigger,
  StrictProps,
  deriveRenderOpts,
  ensureGlobalVariants,
} from "@plasmicapp/react-web";

import "@plasmicapp/react-web/lib/plasmic.css";

import plasmic_plasmic_kit_design_system_css from "../PP__plasmickit_design_system.module.css"; // plasmic-import: tXkSR39sgCDWSitZxC5xFV/projectcss
import plasmic_plasmic_kit_color_tokens_css from "../plasmic_kit_q_4_color_tokens/plasmic_plasmic_kit_q_4_color_tokens.module.css"; // plasmic-import: 95xp9cYcv7HrNWpFWWhbcv/projectcss
import projectcss from "./plasmic_plasmic_kit_comments.module.css"; // plasmic-import: BP7V3EkXPURJVwwMyWoHn/projectcss
import sty from "./PlasmicReactionButton.module.css"; // plasmic-import: FOzDmFDbWm/css

export type PlasmicReactionButton__VariantMembers = {
  includesSelf: "includesSelf";
};

export type PlasmicReactionButton__VariantsArgs = {
  includesSelf?: SingleBooleanChoiceArg<"includesSelf">;
};

type VariantPropType = keyof PlasmicReactionButton__VariantsArgs;
export const PlasmicReactionButton__VariantProps = new Array<VariantPropType>(
  "includesSelf"
);

export type PlasmicReactionButton__ArgsType = {};
type ArgPropType = keyof PlasmicReactionButton__ArgsType;
export const PlasmicReactionButton__ArgProps = new Array<ArgPropType>();

export type PlasmicReactionButton__OverridesType = {
  root?: p.Flex<"button">;
  emoji?: p.Flex<"div">;
  count?: p.Flex<"div">;
};

export interface DefaultReactionButtonProps {
  includesSelf?: SingleBooleanChoiceArg<"includesSelf">;
  className?: string;
}

function PlasmicReactionButton__RenderFunc(props: {
  variants: PlasmicReactionButton__VariantsArgs;
  args: PlasmicReactionButton__ArgsType;
  overrides: PlasmicReactionButton__OverridesType;

  forNode?: string;
}) {
  const { variants, overrides, forNode } = props;

  const $ctx = ph.useDataEnv?.() || {};
  const args = React.useMemo(
    () =>
      Object.assign(
        {},

        props.args
      ),
    [props.args]
  );

  const $props = {
    ...args,
    ...variants,
  };

  return (
    true ? (
      <button
        data-plasmic-name={"root"}
        data-plasmic-override={overrides.root}
        data-plasmic-root={true}
        data-plasmic-for-node={forNode}
        className={classNames(
          projectcss.all,
          projectcss.button,
          projectcss.root_reset,
          projectcss.plasmic_default_styles,
          projectcss.plasmic_mixins,
          plasmic_plasmic_kit_design_system_css.plasmic_tokens,
          plasmic_plasmic_kit_color_tokens_css.plasmic_tokens,
          sty.root,
          {
            [sty.rootincludesSelf]: hasVariant(
              variants,
              "includesSelf",
              "includesSelf"
            ),
          }
        )}
      >
        <div
          data-plasmic-name={"emoji"}
          data-plasmic-override={overrides.emoji}
          className={classNames(
            projectcss.all,
            projectcss.__wab_text,
            sty.emoji
          )}
        >
          {"👍"}
        </div>

        <div
          data-plasmic-name={"count"}
          data-plasmic-override={overrides.count}
          className={classNames(
            projectcss.all,
            projectcss.__wab_text,
            sty.count
          )}
        >
          {"1"}
        </div>
      </button>
    ) : null
  ) as React.ReactElement | null;
}

const PlasmicDescendants = {
  root: ["root", "emoji", "count"],
  emoji: ["emoji"],
  count: ["count"],
} as const;
type NodeNameType = keyof typeof PlasmicDescendants;
type DescendantsType<T extends NodeNameType> =
  typeof PlasmicDescendants[T][number];
type NodeDefaultElementType = {
  root: "button";
  emoji: "div";
  count: "div";
};

type ReservedPropsType = "variants" | "args" | "overrides";
type NodeOverridesType<T extends NodeNameType> = Pick<
  PlasmicReactionButton__OverridesType,
  DescendantsType<T>
>;
type NodeComponentProps<T extends NodeNameType> = {
  // Explicitly specify variants, args, and overrides as objects
  variants?: PlasmicReactionButton__VariantsArgs;
  args?: PlasmicReactionButton__ArgsType;
  overrides?: NodeOverridesType<T>;
} & Omit<PlasmicReactionButton__VariantsArgs, ReservedPropsType> & // Specify variants directly as props
  // Specify args directly as props
  Omit<PlasmicReactionButton__ArgsType, ReservedPropsType> &
  // Specify overrides for each element directly as props
  Omit<
    NodeOverridesType<T>,
    ReservedPropsType | VariantPropType | ArgPropType
  > &
  // Specify props for the root element
  Omit<
    Partial<React.ComponentProps<NodeDefaultElementType[T]>>,
    ReservedPropsType | VariantPropType | ArgPropType | DescendantsType<T>
  >;

function makeNodeComponent<NodeName extends NodeNameType>(nodeName: NodeName) {
  type PropsType = NodeComponentProps<NodeName> & { key?: React.Key };
  const func = function <T extends PropsType>(
    props: T & StrictProps<T, PropsType>
  ) {
    const { variants, args, overrides } = React.useMemo(
      () =>
        deriveRenderOpts(props, {
          name: nodeName,
          descendantNames: [...PlasmicDescendants[nodeName]],
          internalArgPropNames: PlasmicReactionButton__ArgProps,
          internalVariantPropNames: PlasmicReactionButton__VariantProps,
        }),
      [props, nodeName]
    );

    return PlasmicReactionButton__RenderFunc({
      variants,
      args,
      overrides,
      forNode: nodeName,
    });
  };
  if (nodeName === "root") {
    func.displayName = "PlasmicReactionButton";
  } else {
    func.displayName = `PlasmicReactionButton.${nodeName}`;
  }
  return func;
}

export const PlasmicReactionButton = Object.assign(
  // Top-level PlasmicReactionButton renders the root element
  makeNodeComponent("root"),
  {
    // Helper components rendering sub-elements
    emoji: makeNodeComponent("emoji"),
    count: makeNodeComponent("count"),

    // Metadata about props expected for PlasmicReactionButton
    internalVariantProps: PlasmicReactionButton__VariantProps,
    internalArgProps: PlasmicReactionButton__ArgProps,
  }
);

export default PlasmicReactionButton;
/* prettier-ignore-end */