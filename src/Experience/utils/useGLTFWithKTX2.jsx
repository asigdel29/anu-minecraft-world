import { useCallback } from "react";

import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { KTX2Loader } from "three-stdlib";

// Basis/KTX2 transcoder is vendored locally under public/basis/.
const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath("/basis/");

// Self-hosted Draco decoder path (public/draco/). Passing this string to
// useGLTF makes drei's DRACOLoader fetch the decoder from our own origin
// instead of the gstatic CDN, which keeps the Content-Security-Policy tight
// (no external connect-src) and avoids a third-party dependency at load time.
const DRACO_DECODER_PATH = "/draco/";

/**
 * Load a glTF that uses KTX2 (Basis) textures and Draco-compressed geometry,
 * wiring up the locally hosted transcoder/decoder.
 *
 * @param {string} path URL of the .glb under public/.
 * @returns the parsed glTF (same shape as drei's useGLTF).
 */
export function useGLTFWithKTX2(path) {
  const { gl } = useThree();

  return useGLTF(path, DRACO_DECODER_PATH, true, (loader) => {
    loader.setKTX2Loader(ktx2Loader.detectSupport(gl));
  });
}

/**
 * Returns a function that warms drei's loader cache for a .glb, configured
 * identically to {@link useGLTFWithKTX2} so the later mount is a cache hit.
 * A hook because KTX2 transcoding targets depend on the live renderer.
 *
 * @returns {(path: string) => void} preloader safe to call repeatedly.
 */
export function usePreloadGLTFWithKTX2() {
  const { gl } = useThree();

  return useCallback(
    (path) => {
      useGLTF.preload(path, DRACO_DECODER_PATH, true, (loader) => {
        loader.setKTX2Loader(ktx2Loader.detectSupport(gl));
      });
    },
    [gl]
  );
}
