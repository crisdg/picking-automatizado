import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface EntregaProductoAttributes {
    entregaProductoId?: number;
    entregaId: number;
    puesto: string;
    nivel: string;
    ubicacion: string;
    cantidad: number;
    ean: string;
    estado: string;
    timestamp_scan: Date;
    user_scan: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class EntregaProducto extends Model<EntregaProductoAttributes> implements EntregaProductoAttributes {
    public entregaProductoId!: number;
    public entregaId!: number;
    public puesto!: string;
    public nivel!: string;
    public ubicacion!: string;
    public cantidad!: number;
    public ean!: string;
    public estado!: string;
    public timestamp_scan!: Date;
    public user_scan!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static associate(models: any) {
        // define association here
        EntregaProducto.belongsTo(models.Entrega, { foreignKey: 'entregaId', as: 'entrega' });
    }
}

export function initEntregaProductoModel(sequelize: Sequelize): ModelStatic<EntregaProducto> {
    EntregaProducto.init(
        {
            entregaProductoId: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            entregaId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            puesto: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            nivel: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            ubicacion: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            cantidad: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            ean: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            estado: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            timestamp_scan: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            user_scan: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'EntregaProducto',
            tableName: 'EntregaProductos',
            timestamps: true,
        }
    );
    return EntregaProducto;
} 