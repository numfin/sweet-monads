import { AnyHow } from "../../anyhow/index.js";
import { Ok, OptionFrom } from "../../index.js";
import { SchemaCustom } from "./custom.js";
function defaultVahter() {
    return SchemaCustom((v) => {
        if (typeof v !== "string") {
            return AnyHow.expect("string", typeof v).toErr();
        }
        else {
            return Ok(v);
        }
    });
}
export function SchemaStr(vahter = defaultVahter()) {
    const api = {
        optional() {
            return SchemaStr(vahter.optional());
        },
        parse(v) {
            return vahter.parse(v);
        },
        check(v) {
            return vahter.check(v);
        },
        is(fn) {
            return SchemaStr(vahter.is(fn));
        },
        transform(fn) {
            return SchemaStr(vahter.transform(fn));
        },
        max(len) {
            return SchemaStr(vahter.is((v) => v.length <= len));
        },
        min(len) {
            return SchemaStr(vahter.is((v) => v.length >= len));
        },
        numeric() {
            return api.re(() => /^\d*$/gmu, "numeric string");
        },
        alphabetic() {
            return api.re(() => /^[\p{Letter}\p{Mark}]*$/gmu, "alphabetic string");
        },
        alphanumeric() {
            return api.re(() => /^[\p{Letter}\p{Mark}\d]*$/gmu, "alphanumeric string");
        },
        re(re, kind) {
            return SchemaStr(vahter.transform((v) => {
                const invokedRe = re();
                return regexp(invokedRe, kind ?? invokedRe.source, v);
            }));
        },
    };
    return api;
}
const regexp = (re, kind, value) => OptionFrom.bool(re.test(value))
    .result(() => AnyHow.expect(kind, value))
    .map(() => value)
    .orElse((err) => err.toErr());
