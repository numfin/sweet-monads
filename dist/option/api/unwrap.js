import { format } from "./format";
export function unwrap(option) {
    const inner = option.inner();
    if (inner.type === "None") {
        throw new Error(`unwrap called on ${format(option)}`);
    }
    return inner.value;
}
