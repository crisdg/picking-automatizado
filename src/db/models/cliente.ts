import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface ClienteAttributes {
    clienteId?: number;
    firstName: string;
    lastName: string;
    nroCuenta: number;
    zona: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Cliente extends Model<ClienteAttributes> implements ClienteAttributes {
    public clienteId!: number;
    public firstName!: string;
    public lastName!: string;
    public nroCuenta!: number;
    public zona!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static associate(models: any) {
        // define association here
        Cliente.hasMany(models.Pedido, { foreignKey: 'clienteId', as: 'pedidos' });
    }
}

export function initClienteModel(sequelize: Sequelize): ModelStatic<Cliente> {
    Cliente.init(
        {
            clienteId: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            nroCuenta: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            zona: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Cliente',
            tableName: 'Clientes',
            timestamps: true,
        }
    );
    return Cliente;
} 