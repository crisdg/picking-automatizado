import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes, ModelCtor } from 'sequelize';
import process from 'process';
import { Cliente, initClienteModel } from './cliente';
import { Pedido, initPedidoModel } from './pedido';
import { Entrega, initEntregaModel } from './entrega';
import { EntregaProducto, initEntregaProductoModel } from './entregaproducto';
import { User, initUserModel } from './user';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require(path.join(__dirname, '/../config/config.json'))[env];

export interface Db {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  Cliente: ModelCtor<Cliente>;
  Pedido: ModelCtor<Pedido>;
  Entrega: ModelCtor<Entrega>;
  EntregaProducto: ModelCtor<EntregaProducto>;
  User: ModelCtor<User>;
  [key: string]: any;
}

const db = {} as Db;

// Helper type para modelos con associate
interface ModelWithAssociate {
  associate?: (models: any) => void;
}

let sequelize: Sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable] as string, config);
} else {
  sequelize = new Sequelize(
    config.database as string,
    config.username as string,
    config.password as string,
    config
  );
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Cliente = initClienteModel(sequelize);
db.Pedido = initPedidoModel(sequelize);
db.Entrega = initEntregaModel(sequelize);
db.EntregaProducto = initEntregaProductoModel(sequelize);
db.User = initUserModel(sequelize);

// Asociaciones
(db.Cliente as ModelWithAssociate).associate?.(db);
(db.Pedido as ModelWithAssociate).associate?.(db);
(db.Entrega as ModelWithAssociate).associate?.(db);
(db.EntregaProducto as ModelWithAssociate).associate?.(db);
(db.User as ModelWithAssociate).associate?.(db);

export default db;
