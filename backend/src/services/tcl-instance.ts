import TCL from "./tcl";

let tclInstance: TCL | null = null;


export function getTclInstance() {
  if (!tclInstance) {
    tclInstance = new TCL();
  }
  return tclInstance;
}

export const tcl = new Proxy({} as TCL, {
  get(_target, prop) {
    const instance = getTclInstance();
    const value = instance[prop as keyof TCL];
    return typeof value === "function" ? value.bind(instance) : value;
  }
})
