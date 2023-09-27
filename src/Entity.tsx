import * as React from "react";
import { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import * as Vector from "@graph-ts/vector2";

import { EntityType } from "./types";

function angle(b: Vector.Vector2) {
  return Math.atan2(b.y, b.x); //radians
}

function distance(a: Vector.Vector2, b: Vector.Vector2) {
  return Vector.length(Vector.subtract(a, b));
}

export default function Entity({
  value,
  type,
  pos,
  size,
  scale,
  rotation,
  uuid,
  i,
}: {
  value: string;
  type: EntityType;
  pos: Vector.Vector2;
  size: Vector.Vector2;
  scale: number;
  rotation: number;
  uuid: string;
  i: number;
}) {
  let img = useRef<HTMLImageElement>(null);

  return (
    <React.Fragment key={uuid}>
      {type === EntityType.Image && (
        <img
          key={uuid}
          ref={img}
          className={classNames("photo draggable ", {})}
          src={
            value.startsWith("http") ? value : window.location.origin + value
          }
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale}) `,
            display: "flex",
            zIndex: 500,
          }}
        ></img>
      )}
    </React.Fragment>
  );
}

function getTransform(el: Element) {
  try {
    let st = window.getComputedStyle(el, null);
    let tr =
      st.getPropertyValue("-webkit-transform") ||
      st.getPropertyValue("-moz-transform") ||
      st.getPropertyValue("-ms-transform") ||
      st.getPropertyValue("-o-transform") ||
      st.getPropertyValue("transform") ||
      "FAIL";

    return tr.split("(")[1].split(")")[0].split(",");
  } catch (e) {
    console.log(e);
    return [0, 0, 0, 0];
  }
}
