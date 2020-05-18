import { assert, ensure } from "../common";
import {
  PlasmicASTNode,
  PlasmicJsxElement,
  PlasmicArgRef,
} from "../plasmic-ast";
import {
  getSource,
  parseFromJsxExpression,
  CodeVersion,
} from "../plasmic-parser";
import * as L from "lodash";
import traverse, { Node, NodePath } from "@babel/traverse";
import * as parser from "@babel/parser";
import { formatted, code } from "../utils";

const assertKVAttr = (
  input: string,
  attr: string | [string, PlasmicASTNode | null],
  expectedName: string,
  expectedValue: string
) => {
  assert(!L.isString(attr));
  assert(attr[0] === expectedName);
  assert(getSource(ensure(attr[1]).rawNode, input) === expectedValue);
};

const assertNodeAttr = (
  input: string,
  attr: string | [string, PlasmicASTNode | null],
  expectedName: string,
  f: (value: PlasmicASTNode) => void
) => {
  assert(!L.isString(attr));
  assert(attr[0] === expectedName);
  assert(!L.isString(attr[1]));
  assert(attr[1]);
  f(attr[1]);
};

const assertPlasmicJsxElementBase = (
  n: PlasmicJsxElement,
  expcetedPlasmicId: string,
  inHtmlContext: boolean,
  tag: string,
  numAttrs: number,
  numChildren: number
) => {
  const name = n.rawNode.openingElement.name;
  if (name.type === "JSXIdentifier") {
    assert(name.name === tag);
  } else {
    assert(false, "Unimplemented");
  }
  assert(n.nameInId === expcetedPlasmicId);
  assert(n.attrs.length === numAttrs);
  assert(n.children.length === numChildren);
};
const assertTagOrComponent = (
  n: PlasmicASTNode | undefined,
  rawNodeType?: string
) => {
  assert(n);
  assert(n.type === "tag-or-component");
  if (rawNodeType) {
    assert(n.rawNode.type === rawNodeType);
  }
  return n.jsxElement;
};
const assertStringLit = (n: PlasmicASTNode, value: string) => {
  assert(n.type === "string-lit");
  assert(n.value === value);
};
const assertTextNode = (n: PlasmicASTNode, value: string) => {
  assert(n.type === "text");
  assert(n.value === value);
};

const assertOpaqueNode = (n: PlasmicASTNode, value: string) => {
  assert(n.type === "opaque");
  assert(n.value === value);
};

const assertCondStrNode = (n: PlasmicASTNode, plasmicId: string) => {
  assert(n.type === "cond-str-call");
  assert(n.plasmicId === plasmicId);
};

const assertArgRefNode = (
  n: PlasmicASTNode,
  argName: string,
  numJsxNodes: number
): n is PlasmicArgRef => {
  assert(n.type === "arg");
  assert(n.argName === argName);
  assert(n.jsxNodes.length === numJsxNodes);
  return true;
};

const assertJsxElement = (node: Node | undefined) => {
  assert(node);
  assert(node.type === "JSXElement");
};

const assertJsxExpressionContainer = (node: Node | undefined, tag: string) => {
  assert(node);
  assert(node.type === "JSXExpressionContainer");
};

const astToString = (node: PlasmicASTNode, input: string) => {
  return getSource(node.rawNode, input);
};

describe("parser", function () {

  it("parse file works", function () {
    const input = `
    // This is a skeleton starter React component generated by Plasmic.
import React, { ReactNode } from "react";
import {
  PlasmicTreeRow__RenderHelper,
  PlasmicTreeRow__VariantsArgs,
  PlasmicTreeRow__VariantsType,
  PlasmicTreeRow__TriggerStateType
} from "../gen/PlasmicTreeRow"; // plasmic-import: rxCVTHM-KfP/render

import { hasVariant, DefaultFlexStack, FlexStack } from "@plasmicapp/react-web";

interface TreeRowProps {
  label?: ReactNode;
  type?: ReactNode;
  triangle?: ReactNode;
  display?: ReactNode;
  more?: ReactNode;
  types?: PlasmicTreeRow__VariantsArgs["types"];
  states?: PlasmicTreeRow__VariantsArgs["states"];

  // Required className prop is used for positioning this component
  className?: string;
}

function TreeRow(props: TreeRowProps) {
  const variants = { types: props.types, states: props.states };
  const args = {
    label: props.label,
    type: props.type,
    triangle: props.triangle,
    display: props.display,
    more: props.more
  };

  // The following code block is fully managed by Plasmic. Don't edit - it will
  // be overwritten after every "plasmic sync".
  // plasmic-managed-start

  const rh = new PlasmicTreeRow__RenderHelper(variants, args, props.className);
  // plasmic-managed-end

  // plasmic-managed-jsx/66
  return (
    <DefaultFlexStack {...rh.propsRoot()}>
      <div className={rh.clsLeftIconSlots()}>
        {args.triangle || <div {...rh.props9MoAVl56zyD()} />}
        {args.type || (
          <>
            {rh.showTZ4YvnJs1m0() && <div {...rh.propsTZ4YvnJs1m0()} />}
            {rh.showWJT3dUu2L1W() && <div {...rh.propsWJT3dUu2L1W()} />}
          </>
        )}
      </div>
      <div className={rh.clsLabelSlot()}>
        {args.label == null || typeof args.label === "string" ? (
          <div {...rh.propsLabel()}>{args.label || "Tree Row Label"}</div>
        ) : (
            args.label
          )}
        </div>
        <DefaultFlexStack className={rh.clsRightIconSlots()}>
          {args.display || <div {...rh.propsGgSsc5c_XYW()} />}
          {args.more || <div {...rh.propsNskLZmZ2M3D()} />}
        </DefaultFlexStack>
      </DefaultFlexStack>
    );
  }

  export default TreeRow as React.FunctionComponent<TreeRowProps>;`;

    const file = parser.parse(input, {
      strictMode: true,
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    expect(code(file, {retainLines: true})).toEqual(formatted(input));
  });

  it("non-plasmic node", function () {
    const input = "<div></div>";
    const r = parseFromJsxExpression(input);
    console.log(r);
    assert(astToString(r, input) === "<div></div>");
  });
  it("plasmic node", function () {
    const input = "(<div className={rh.clsAbc()}></div>)";
    const r = parseFromJsxExpression(input);
    assert(r.rawNode.start === 1);
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "Abc", false, "div", 1, 0);
    assertKVAttr(input, jsxElt.attrs[0], "className", "{rh.clsAbc()}");
  });

  it("text node", function () {
    const input = `(<div className={rh.clsAbc()}>  Text
Node  </div>)`;
    const r = parseFromJsxExpression(input);
    assert(r.rawNode.start === 1);
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "Abc", false, "div", 1, 1);
    assertTextNode(jsxElt.children[0], "  Text\nNode  ");
  });

  it("string literal node", function () {
    const input = `(<div className={rh.clsAbc()}> {"Text Node"}  </div>)`;
    const r = parseFromJsxExpression(input);
    assert(r.rawNode.start === 1);
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "Abc", false, "div", 1, 1);
    assertStringLit(jsxElt.children[0], "Text Node");
  });

  it("condStr node", function () {
    const input = `(<div className={rh.clsAbc()}> {rh.condStrXXX()}  </div>)`;
    const r = parseFromJsxExpression(input);
    assert(r.rawNode.start === 1);
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "Abc", false, "div", 1, 1);
    assertCondStrNode(jsxElt.children[0], "XXX");
  });

  it("argRef node - generic", function () {
    const input = `(<Button className={rh.clsAbc()}> {
            // comment is ok
            // parentheis is ok
            (( args.buttonText)) || "defaultText"}
            </Button>)`;
    const r = parseFromJsxExpression(input);
    assert(r.rawNode.start === 1);
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "Abc", false, "Button", 1, 1);
    assertArgRefNode(jsxElt.children[0], "buttonText", 0);
  });

  it("argRef node - text slot with no wrapper", function () {
    const input = `(<Button className={rh.clsAbc()}>
          {args.buttonText || "defaultText"}
          </Button>)`;
    const r = parseFromJsxExpression(input);
    assert(r.rawNode.start === 1);
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "Abc", false, "Button", 1, 1);
    assertArgRefNode(jsxElt.children[0], "buttonText", 0);
  });

  it("argRef node - text slot with wrapper", function () {
    const input = `(<Button className={rh.clsAbc()}>
          {args.buttonText || typeof args.buttonText === "string"
            ? <div className={rh.clsButtonText()}>
                {args.buttonText || "Click me"}
              </div>
            : "Click me"}
          </Button>)`;
    const r = parseFromJsxExpression(input);
    assert(r.rawNode.start === 1);
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "Abc", false, "Button", 1, 1);
    const child = jsxElt.children[0];
    if (assertArgRefNode(child, "buttonText", 1)) {
      const wrapper = child.jsxNodes[0];
      assertPlasmicJsxElementBase(
        wrapper.jsxElement,
        "ButtonText",
        false,
        "div",
        1,
        1
      );
      assert(
        ensure(getSource(wrapper.rawNode, input)).startsWith("{args.buttonText")
      );
    }
  });

  it("argRef node - slot with default nodes, and auto lifting the boundary", function () {
    const input = `(<Button className={rh.clsAbc()}>
          {args.buttonText ||
            <>
              <div className={rh.clsDefault0()}></div>
              <div>
              {rh.showDefault1() && <a className={rh.clsDefault1()} src="">Click me</a>}
              </div>
              <p>
                <a className={rh.clsDefault2()} src="">Click me</a>
              </p>
            </>
          }
            </Button>)`;
    const r = parseFromJsxExpression(input);
    assert(r.rawNode.start === 1);
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "Abc", false, "Button", 1, 1);
    const child = jsxElt.children[0];
    if (assertArgRefNode(child, "buttonText", 3)) {
      assert(
        ensure(getSource(child.jsxNodes[0].rawNode, input)).startsWith("<div")
      );
      assertPlasmicJsxElementBase(
        child.jsxNodes[0].jsxElement,
        "Default0",
        true,
        "div",
        1,
        0
      );
      assert(
        ensure(getSource(child.jsxNodes[1].rawNode, input)).startsWith(
          "{rh.showDefault1()"
        )
      );
      assertPlasmicJsxElementBase(
        child.jsxNodes[1].jsxElement,
        "Default1",
        false,
        "a",
        2,
        1
      );
      assert(
        ensure(getSource(child.jsxNodes[2].rawNode, input)).startsWith(
          "<a className={rh.clsDefault2()}"
        )
      );
      assertPlasmicJsxElementBase(
        child.jsxNodes[2].jsxElement,
        "Default2",
        true,
        "a",
        2,
        1
      );
    }
  });

  it("with show function", function () {
    const input = "rh.showClsAbc() && <div className={rh.clsAbc()}></div>";
    const r = parseFromJsxExpression(input);
    assert(!L.isString(r));
    assert(r.rawNode.start === 0);
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "Abc", false, "div", 1, 0);
    assertKVAttr(input, jsxElt.attrs[0], "className", "{rh.clsAbc()}");
  });

  it("logical expression that we don't inspect comments for", function () {
    const input = `// hello world
        // plasmic-replace-Abc
        rh.showClsXXX() && <Button className={rh.clsXXX()}></Button>`;
    const r = parseFromJsxExpression(input);
    assert(!L.isString(r));
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "XXX", false, "Button", 1, 0);
    assertKVAttr(input, jsxElt.attrs[0], "className", "{rh.clsXXX()}");
  });

  it("nested node with comment", function () {
    const input = `<div>{// hello world
          // plasmic-replace-Abc
          rh.showClsXXX() && <div className={rh.clsXXX()}></div>
          }</div>`;
    const r = parseFromJsxExpression(input);
    assert(!L.isString(r));
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "XXX", false, "div", 1, 0);
    assertKVAttr(input, jsxElt.attrs[0], "className", "{rh.clsXXX()}");
  });

  it("nested without comment", function () {
    const input = `<div><div className={rh.clsXXX()}></div></div>`;
    const r = parseFromJsxExpression(input);
    assert(!L.isString(r));
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "XXX", true, "div", 1, 0);
    assertKVAttr(input, jsxElt.attrs[0], "className", "{rh.clsXXX()}");
  });

  it("parse attributes", function () {
    const input = `<div>
        <Button {...rh.propsXXX()} width={100} icon={<img></img>}
          slot={<a {...rh.propsSlot()}>Hello</a> } {...myProps}>
          {<svg></svg>}
        </Button>
      </div>`;
    const r = parseFromJsxExpression(input);
    assert(!L.isString(r));
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "XXX", true, "Button", 5, 1);
    assert(jsxElt.attrs[0] === "{...rh.propsXXX()}");
    assertKVAttr(input, jsxElt.attrs[1], "width", "{100}");
    assertKVAttr(input, jsxElt.attrs[2], "icon", "{<img></img>}");
    assertNodeAttr(input, jsxElt.attrs[3], "slot", (value: PlasmicASTNode) => {
      const j = assertTagOrComponent(value);
      assertPlasmicJsxElementBase(j, "Slot", false, "a", 1, 1);
      assert(j.attrs[0] === "{...rh.propsSlot()}");
      assertTextNode(j.children[0], "Hello");
    });
    assert(jsxElt.attrs[4] === "{...myProps}");
    assertOpaqueNode(jsxElt.children[0], "{<svg></svg>}");
  });

  it("parse real generated code", function () {
    const r = parseFromJsxExpression(`<div className={rh.clsRoot()}>
        <div className={rh.clsXznmtPNB0Zyw()}>
          <div className={rh.clsDVE$i8K$uR8I()}>Code Sandbox</div>
          <DefaultFlexStack className={rh.clsRqL5xG5ECSOA()}>
            {rh.showOpenButton() && (
              <TextButton
                {...rh.propsOpenButton()}
                icon={<img {...rh.propsXIMhb4EWD7N5()} />}
              >
                {rh.childStrOpenButton()}
              </TextButton>
            )}
            <img {...rh.propsCloseButton()} />
          </DefaultFlexStack>
        </div>
        <div className={rh.clsMbPAaDNcXM5s()} />
        <div className={rh.clsCreateHint()}>
          {rh.showIntroHint() && (
            <div className={rh.clsIntroHint()}>{rh.childStrIntroHint()}</div>
          )}
          <div className={rh.clsAPtd$PZhZqVc()}>
            To persist your edits to the sandbox, check your email box to "Accept
            invitation" and sign into CodeSandbox.
          </div>
          {rh.showCreateHint2() && (
            <div className={rh.clsCreateHint2()}>{rh.childStrCreateHint2()}</div>
          )}
        </div>
        {rh.showCreateButton() && (
          <TextButton
            {...rh.propsCreateButton()}
            icon={<img {...rh.propsR8waVUlOuwIZ()} />}
          >
            Create Sandbox
          </TextButton>
        )}
        <div className={rh.clsCreateHint3()}>
          {rh.showIntroHint2() && (
            <div className={rh.clsIntroHint2()}>{rh.childStrIntroHint2()}</div>
          )}
          <div className={rh.cls$tDW3wts27tj()}>
            To persist your edits to the sandbox, check your email box to "Accept
            invitation" and sign into CodeSandbox.
          </div>
          {rh.showCreateHint22() && (
            <div className={rh.clsCreateHint22()}>
              {rh.childStrCreateHint22()}
            </div>
          )}
        </div>
        {rh.showYgQu51QqVa9y() && (
          <DefaultFlexStack className={rh.clsYgQu51QqVa9y()}>
            <input {...rh.propsEmail()} />
            <InviteButton {...rh.propsInviteButton()} />
            <div className={rh.clsGlQ7hFHUwTq8()} />
            { // plasmic-preserve
              rh.showUpdateButton() && (
              <TextButton
                {...rh.propsUpdateButton()}
                icon={
                  rh.showSJpAZVmiP_ua() && <img {...rh.propsSJpAZVmiP_ua()} />
                }
              >
                {rh.childStrUpdateButton()}
              </TextButton>
            )}
            <img {...rh.propsZv94XH9M$()} />
          </DefaultFlexStack>
        )}
      </div>`);

    assert(!L.isString(r));
    const jsxElt = assertTagOrComponent(r);
    assertPlasmicJsxElementBase(jsxElt, "Root", false, "div", 1, 6);
  });

  it("parse all nodes", function () {
    const nameInIds = [
      "Root",
      "XznmtPNB0Zyw",
      "DVE$i8K$uR8I",
      "RqL5xG5ECSOA",
      "OpenButton",
      "XIMhb4EWD7N5",
      "CloseButton",
    ];
    const cv = new CodeVersion(
      `
      <div className={rh.clsRoot()}>
        <div className={rh.clsXznmtPNB0Zyw()}>
          <div className={rh.clsDVE$i8K$uR8I()}>Code Sandbox</div>
          <DefaultFlexStack className={rh.clsRqL5xG5ECSOA()}>
            {rh.showOpenButton() && (
              <TextButton
                {...rh.propsOpenButton()}
                icon={<img {...rh.propsXIMhb4EWD7N5()} />}
              >
                {rh.childStrOpenButton()}
              </TextButton>
            )}
            <img {...rh.propsCloseButton()} />
          </DefaultFlexStack>
        </div>
      </div>`,
      new Map<string, string>(nameInIds.map((id) => [id, `uuid${id}`]))
    );
    assert(cv.tagOrComponents.size === nameInIds.length);

    // test findNode
    assertTagOrComponent(
      cv.findNode({ nameInId: "Root", uuid: "Root" }),
      "JSXElement"
    );
    assertTagOrComponent(
      cv.findNode({ nameInId: "XznmtPNB0Zyw", uuid: "XznmtPNB0Zyw" }),
      "JSXElement"
    );
    assertTagOrComponent(
      cv.findNode({ nameInId: "DVE$i8K$uR8I", uuid: "DVE$i8K$uR8I" }),
      "JSXElement"
    );
    const flexStack = ensure(
      cv.findNode({ nameInId: "RqL5xG5ECSOA", uuid: "RqL5xG5ECSOA" })
    );
    assertTagOrComponent(flexStack, "JSXElement");
    const openButton = ensure(
      cv.findNode({ nameInId: "OpenButton", uuid: "OpenButton" })
    );
    assertTagOrComponent(openButton, "JSXExpressionContainer");
    assertTagOrComponent(
      cv.findNode({ nameInId: "XIMhb4EWD7N5", uuid: "XIMhb4EWD7N5" }),
      "JSXExpressionContainer"
    );
    const closeButton = ensure(
      cv.findNode({ nameInId: "CloseButton", uuid: "uuidCloseButton" })
    );
    assertTagOrComponent(closeButton, "JSXElement");
    // findNode fallback to uuid
    assertTagOrComponent(
      cv.findNode({ nameInId: "RootRenamed", uuid: "uuidRoot" }),
      "JSXElement"
    );
    // getId
    assert(cv.root.type === "tag-or-component");
    const rootIds = cv.getId(cv.root);
    assert(rootIds.nameInId === "Root");
    assert(rootIds.uuid === "uuidRoot");

    // serach
    assert(cv.hasClassNameIdAttr(cv.root));
    assert(!cv.hasPropsIdSpreador(cv.root));
    assert(!cv.hasShowFuncCall(cv.root));

    assert(!cv.hasClassNameIdAttr(closeButton));
    assert(cv.hasPropsIdSpreador(closeButton));
    assert(!cv.hasShowFuncCall(closeButton));

    assert(!cv.hasClassNameIdAttr(openButton));
    assert(cv.hasPropsIdSpreador(openButton));
    assert(cv.hasShowFuncCall(openButton));
  });
});
