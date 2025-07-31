import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface PedidoAttributes {
    pedidoId?: number;
    clienteId: number;
    campania: string;
    zona: string;
    fecha_creacion: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Pedido extends Model<PedidoAttributes> implements PedidoAttributes {
    public pedidoId!: number;
    public clienteId!: number;
    public campania!: string;
    public zona!: string;
    public fecha_creacion!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static associate(models: any) {
        // define association here
        Pedido.belongsTo(models.Cliente, { foreignKey: 'clienteId', as: 'cliente' });
        Pedido.hasMany(models.Entrega, { foreignKey: 'pedidoId', as: 'entregas' });
    }
}

export function initPedidoModel(sequelize: Sequelize): ModelStatic<Pedido> {
    Pedido.init(
        {
            pedidoId: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            clienteId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            campania: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            zona: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fecha_creacion: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Pedido',
            tableName: 'Pedidos',
            timestamps: true,
        }
    );
    return Pedido;
} 