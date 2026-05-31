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
