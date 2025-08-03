import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface EntregaAttributes {
    entregaId?: number;
    pedidoId: number;
    nroEntrega: number;
    estado: string;
    timestamp_inicio: Date;
    timestamp_fin: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Entrega extends Model<EntregaAttributes> implements EntregaAttributes {
    public entregaId!: number;
    public pedidoId!: number;
    public nroEntrega!: number;
    public estado!: string;
    public timestamp_inicio!: Date;
    public timestamp_fin!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static associate(models: any) {
        // define association here
        Entrega.belongsTo(models.Pedido, { foreignKey: 'pedidoId', as: 'pedido' });
        Entrega.hasMany(models.EntregaProducto, { foreignKey: 'nroEntrega', sourceKey: 'nroEntrega', as: 'productos' });
    }
}

export function initEntregaModel(sequelize: Sequelize): ModelStatic<Entrega> {
    Entrega.init(
        {
            entregaId: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            pedidoId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'Pedidos',
                    key: 'pedidoId',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },

            nroEntrega: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                unique: true,
            },
            estado: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            timestamp_inicio: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            timestamp_fin: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Entrega',
            tableName: 'Entregas',
            timestamps: true,
        }
    );
    return Entrega;
} 