import test from "ava";
import { NewOption, Schema } from "../../index.js";
import { eq } from "../../option/api/eq.js";
test("Convert value to union", (t) => {
    const s = Schema.union({
        v1: Schema.str(),
        v2: Schema.num(),
        v3: Schema.num().optional(),
        v4: Schema.dict({
            f1: Schema.num(),
            f2: Schema.union({
                f2v1: Schema.arr(Schema.str()),
                f2v2: Schema.num(),
            }),
        }),
    });
    t.true(s.parse("asd").unwrap().is("v1"));
    t.true(s.parse(34).unwrap().is("v2"));
    t.true(s.parse(null).unwrap().is("v3"));
    t.true(s
        .parse({
        f1: 0,
        f2: ["hi"],
    })
        .unwrap()
        .is("v4"));
    t.true(s
        .parse({
        f1: 3,
        f2: 4,
    })
        .unwrap()
        .is("v4"));
});
test("match union", (t) => {
    const tUnion = Schema.union({
        v1: Schema.str(),
        v2: Schema.num(),
        v3: Schema.num().optional(),
    });
    const matcher = {
        v1(v) {
            t.is(v, "");
            return "v1";
        },
        v2(v) {
            t.is(v, 10);
            return "v2";
        },
        v3(v) {
            t.true(v.do(eq(NewOption.Some(20))));
            return "v3";
        },
    };
    t.is(tUnion.v1("").match(matcher), "v1");
    t.is(tUnion.v2(10).match(matcher), "v2");
    t.is(tUnion.v3(NewOption.Some(20)).match(matcher), "v3");
});
test("matchSome union", (t) => {
    const tUnion = Schema.union({
        v1: Schema.str(),
        v2: Schema.num(),
        v3: Schema.num().optional(),
    });
    const matcher = {
        v1(v) {
            t.is(v, "");
            return "v1";
        },
        v2(v) {
            t.is(v, 10);
            return "v2";
        },
        v3(v) {
            t.true(v.do(eq(NewOption.Some(20))));
            return "v3";
        },
    };
    t.true(tUnion
        .v1("")
        .matchSome({
        v1: matcher.v1,
    })
        .do(eq(NewOption.Some("v1"))));
    t.true(tUnion
        .v2(10)
        .matchSome({
        v2: matcher.v2,
    })
        .do(eq(NewOption.Some("v2"))));
    t.true(tUnion
        .v3(NewOption.Some(20))
        .matchSome({
        v3: matcher.v3,
    })
        .do(eq(NewOption.Some("v3"))));
});
test("Union inside dict", (t) => {
    const schema = Schema.dict({
        field: Schema.union({
            str: Schema.str(),
            num: Schema.num(),
        }),
    });
    t.true(schema.parse({ field: "" }).unwrap().field.is("str"));
});
test("Optional union", (t) => {
    const schema = Schema.dict({
        inner: Schema.union({
            str: Schema.str(),
            num: Schema.num(),
        }).optional(),
    });
    t.true(schema.parse({ inner: 3 }).unwrap().inner.unwrap().is("num"));
});
