const { EntitySchema } = require("typeorm");
const bcrypt = require("bcrypt");

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      nullable : false
    },
    email: {
      type: "varchar",
      unique: true,
      nullable : false
    },
    password: {
      type: "varchar",
      nullable : false
    },
    role: {
      type: "enum",
      enum: ["Admin", "Staff"],
      default: "Staff",
      nullable : false
    },
    phone: {
      type: "varchar",
      nullable : false
    },
    city: {
      type: "varchar",
      nullable : false
    },
    country: {
      type: "varchar",
      nullable : false
    },
  },
});
