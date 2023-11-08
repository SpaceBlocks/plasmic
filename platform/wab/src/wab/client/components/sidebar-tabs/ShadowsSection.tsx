import { Tooltip } from "antd";
import { observer } from "mobx-react";
import React from "react";
import { BoxShadow, BoxShadows, Dim } from "../../../bg-styles";
import { arrayMoveIndex } from "../../../collections";
import { removeFromArray } from "../../../commons/collections";
import { MaybeWrap } from "../../../commons/components/ReactUtil";
import { derefTokenRefs, tryParseTokenRef } from "../../../commons/StyleToken";
import * as cssPegParser from "../../../gen/cssPegParser";
import { VariantedStylesHelper } from "../../../shared/VariantedStylesHelper";
import { allColorTokens, allMixins, allStyleTokens } from "../../../sites";
import { CssVarResolver } from "../../../styles";
import PlusIcon from "../../plasmic/plasmic_kit/PlasmicIcon__Plus";
import { StudioCtx } from "../../studio-ctx/StudioCtx";
import { makeVariantedStylesHelperFromCurrentCtx } from "../../utils/style-utils";
import { shouldBeDisabled } from "../sidebar/sidebar-helpers";
import { SidebarModal } from "../sidebar/SidebarModal";
import { BoxShadowPanel } from "../style-controls/BoxShadowControls";
import { ColorSwatch } from "../style-controls/ColorSwatch";
import {
  StyleComponent,
  StyleComponentProps,
  StylePanelSection,
} from "../style-controls/StyleComponent";
import { StyleWrapper } from "../style-controls/StyleWrapper";
import { IconLinkButton, ListBox, ListBoxItem } from "../widgets";
import { Icon } from "../widgets/Icon";

interface ShadowsPanelSectionState {
  inspectedShadow?: BoxShadow;
  // index of the inspected shadow
  index?: number;
}

const resolvedShadowCss = (
  shadow: BoxShadow,
  sc: StudioCtx,
  vsh: VariantedStylesHelper
) => {
  const site = sc.site;
  const resolver = new CssVarResolver(
    allStyleTokens(site, { includeDeps: "all" }),
    allMixins(site, { includeDeps: "all" }),
    site.imageAssets,
    site.activeTheme,
    {},
    vsh
  );
  return resolver.resolveTokenRefs(shadow.showCss());
};

class _ShadowsPanelSection extends StyleComponent<
  StyleComponentProps,
  ShadowsPanelSectionState
> {
  constructor(props: StyleComponentProps) {
    super(props);
    this.state = {};
  }
  updateBoxShadows = (boxShadows: BoxShadows) => {
    return this.change(() => {
      return boxShadows.shadows.length
        ? this.exp().set("box-shadow", boxShadows.showCss())
        : this.exp().set("box-shadow", "none");
    });
  };
  inspectBoxShadow = (shadow: /*TWZ*/ BoxShadow, index: number) => {
    this.setState({ inspectedShadow: shadow, index });
  };

  render() {
    const boxShadows: BoxShadows = (() => {
      const v = this.exp().get("box-shadow");
      if (v === "none") {
        return new BoxShadows([]);
      } else {
        return cssPegParser.parse(v, { startRule: "boxShadows" });
      }
    })();
    const { inspectedShadow, index } = this.state;
    const addShadowLayer = () => {
      const layer = new BoxShadow({
        inset: false,
        x: new Dim(0, "px"),
        y: new Dim(4, "px"),
        blur: new Dim(16, "px"),
        spread: new Dim(0, "px"),
        color: "rgba(0,0,0,0.2)",
      });

      boxShadows.shadows.push(layer);

      this.updateBoxShadows(boxShadows);
      this.inspectBoxShadow(layer, boxShadows.shadows.length - 1);
    };

    const { isDisabled, disabledTooltip } = shouldBeDisabled({
      props: {},
      label: "Shadows",
      indicators: this.definedIndicators("box-shadow"),
    });

    const vsh =
      this.props.vsh ??
      makeVariantedStylesHelperFromCurrentCtx(this.studioCtx());

    return (
      <StylePanelSection
        key={String(boxShadows.shadows.length > 0)}
        expsProvider={this.props.expsProvider}
        title={"Shadows"}
        styleProps={["box-shadow"]}
        onExpanded={() => {
          if (boxShadows.shadows.length === 0) {
            addShadowLayer();
          }
        }}
        onHeaderClick={
          boxShadows.shadows.length === 0 ? addShadowLayer : undefined
        }
        controls={
          <MaybeWrap
            cond={!!disabledTooltip && !!isDisabled}
            wrapper={(e) => <Tooltip title={disabledTooltip}>{e}</Tooltip>}
          >
            <IconLinkButton onClick={addShadowLayer} disabled={isDisabled}>
              <Icon icon={PlusIcon} />
            </IconLinkButton>
          </MaybeWrap>
        }
        defaultHeaderAction={() => !isDisabled && addShadowLayer()}
      >
        {boxShadows.shadows.length > 0 && (
          <>
            <SidebarModal
              show={!!inspectedShadow && !isDisabled}
              onClose={() => this.setState({ inspectedShadow: undefined })}
              title="Shadow"
            >
              {inspectedShadow && index !== undefined && (
                <div className="panel-content">
                  <BoxShadowPanel
                    expsProvider={this.props.expsProvider}
                    defaultShadow={inspectedShadow}
                    onUpdated={() => {
                      boxShadows.shadows[index] = inspectedShadow;
                      this.updateBoxShadows(boxShadows);
                    }}
                    vsh={vsh}
                  />
                </div>
              )}
            </SidebarModal>
            <StyleWrapper
              styleName={["box-shadow"]}
              className="flex-fill"
              showDefinedIndicator={true}
            >
              <ListBox
                ref={"boxShadowList"}
                appendPrepend={"append"}
                {...(isDisabled
                  ? {}
                  : {
                      onReorder: (from, to) => {
                        boxShadows.shadows = arrayMoveIndex(
                          boxShadows.shadows,
                          from,
                          to
                        );
                        this.updateBoxShadows(boxShadows);
                      },
                    })}
              >
                {boxShadows.shadows.map((shadow: BoxShadow, i: number) => {
                  const sc = this.props.expsProvider.studioCtx;
                  const color = derefTokenRefs(
                    allStyleTokens(sc.site, { includeDeps: "all" }),
                    shadow.color,
                    vsh
                  );
                  const token = tryParseTokenRef(
                    shadow.color,
                    allColorTokens(sc.site, { includeDeps: "all" })
                  );
                  return (
                    <ListBoxItem
                      key={i}
                      index={i}
                      onRemove={() => {
                        if (!isDisabled) {
                          removeFromArray(boxShadows.shadows, shadow);
                          return this.updateBoxShadows(boxShadows);
                        }
                      }}
                      onClick={() =>
                        !isDisabled && this.inspectBoxShadow(shadow, i)
                      }
                      mainContent={
                        <>
                          <ColorSwatch color={color} />
                          <code className="ml-sm text-ellipsis">
                            {token ? token.name : color}
                          </code>
                        </>
                      }
                      thumbnail={
                        <div
                          className="shadow-thumb"
                          style={{
                            boxShadow: resolvedShadowCss(shadow, sc, vsh),
                          }}
                        />
                      }
                      gridThumbnail
                    />
                  );
                })}
              </ListBox>
            </StyleWrapper>
          </>
        )}
      </StylePanelSection>
    );
  }
}
export const ShadowsPanelSection = observer(_ShadowsPanelSection);