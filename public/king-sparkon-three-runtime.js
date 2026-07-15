/* eslint-disable */
import * as THREE from "https://esm.sh/three@0.180.0";
import { gsap } from "https://esm.sh/gsap@3.13.0";

window.__KING_SPARKON_3D__ = { THREE, gsap };
window.dispatchEvent(new CustomEvent("king-sparkon:3d-ready"));
