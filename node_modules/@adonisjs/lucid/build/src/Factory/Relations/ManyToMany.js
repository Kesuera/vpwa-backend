"use strict";
/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManyToMany = void 0;
const Base_1 = require("./Base");
/**
 * Many to many factory relation
 */
class ManyToMany extends Base_1.BaseRelation {
    constructor(relation, factory) {
        super(factory);
        Object.defineProperty(this, "relation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: relation
        });
        this.relation.boot();
    }
    /**
     * Make relationship and set it on the parent model instance
     */
    async make(parent, callback, count) {
        const factory = this.compile(callback);
        const instances = await factory.makeStubbedMany(count || 1);
        parent.$setRelated(this.relation.relationName, instances);
    }
    /**
     * Persist relationship and set it on the parent model instance
     */
    async create(parent, callback, count) {
        const factory = this.compile(callback);
        const instances = await factory.createMany(count || 1);
        /**
         * Make pivot insert query
         */
        await this.relation.client(parent, this.ctx.$trx).saveMany(instances);
        /**
         * Setup in-memory relationship
         */
        parent.$setRelated(this.relation.relationName, instances);
    }
}
exports.ManyToMany = ManyToMany;
