declare module 'raf' {
  type RafCallback = (time: number) => void;
  function raf(callback: RafCallback): number;
  namespace raf {
    function cancel(handle: number): void;
  }
  export = raf;
}
