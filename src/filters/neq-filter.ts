import { _ISelection, IValue, _IIndex, _ITable, BuildState } from '../interfaces-private';
import { FilterBase } from './filter-base';

export class NeqFilter<T = any> extends FilterBase<T> {

    get index() {
        return null;
    }

    get entropy() {
        return this.onValue.index.entropy;
    }

    hasItem(item: T) {
        return this.onValue.index.hasItem(item);
    }

    constructor(private onValue: IValue<T>
        , private other: IValue[]) {
        super(onValue.selection);
        if (onValue.index.expressions.length !== other.length) {
            throw new Error('Unexpected index equality expressions count mismatch');
        }
        for (const o of other) {
            if (!o.isConstant) {
                throw new Error('Unexpected error: Index is being compared to a non constant');
            }
        }
    }

    *enumerate(): Iterable<T> {
        const index = this.onValue.index;
        const map = index.expressions.map((v, i) => {
            const otherConv = this.other[i].convert(v.type);
            return otherConv.get(null);
        });
        for (const item of index.neq(map)) {
            yield item;
        }
    }

    sql(state?: BuildState): string {
        const map = this.onValue.index.expressions.map((v, i) => {
            const otherConv = this.other[i].convert(v.type);
            return `${v.id} = ${otherConv.id}`;
        });
        return map.join(' AND ');
    }

}