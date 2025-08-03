import { Request, Response } from "express";
import csv from 'csv-parser';
import * as fs from 'fs';
import { Cliente } from "../db/models/cliente";
import { Pedido } from "../db/models/pedido";
import { Entrega } from "../db/models/entrega";
import { EntregaProducto } from "../db/models/entregaproducto";

interface CSVRow {
    nroCuenta: string;      // 1234567 - Código de cliente
    campania: string;       // 202501 - Campaña
    numeroEntrega: string;  // 0112345676 - Número de entrega
    estacion: string;       // argentina - Estación
    codigoProducto: string; // 32233 - Código de producto/EAN
    nivel: string;          // A - Nivel
    ubicacion: string;      // 001 - Ubicación
    cantidad: string;       // 2 - Cantidad
}

const uploadCSV = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha proporcionado ningún archivo CSV' });
        }

        const { zona, ruta } = req.body;

        if (!zona || !ruta) {
            return res.status(400).json({
                error: 'Se requiere especificar zona y ruta en el body de la petición'
            });
        }

        // Validar que zona sea un número
        const zonaNumber = parseInt(zona);
        if (isNaN(zonaNumber)) {
            return res.status(400).json({
                error: 'La zona debe ser un número válido'
            });
        }

        const results: CSVRow[] = [];
        const filePath = req.file.path;

        // Leer el archivo CSV
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data: any) => results.push(data))
            .on('end', async () => {
                try {
                    // Procesar los datos del CSV para la zona y ruta específica
                    await processCSVDataByZoneAndRoute(results, zonaNumber, ruta);

                    // Eliminar el archivo temporal
                    fs.unlinkSync(filePath);

                    res.json({
                        message: 'Datos cargados exitosamente para la zona y ruta especificada',
                        zona: zonaNumber,
                        ruta,
                        recordsProcessed: results.length
                    });
                } catch (error: any) {
                    // Eliminar el archivo temporal en caso de error
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    res.status(500).json({
                        error: 'Error al procesar los datos',
                        details: error.message
                    });
                }
            })
            .on('error', (error: any) => {
                // Eliminar el archivo temporal en caso de error
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                res.status(500).json({
                    error: 'Error al leer el archivo CSV',
                    details: error.message
                });
            });
    } catch (error: any) {
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};

const processCSVDataByZoneAndRoute = async (data: CSVRow[], zona: number, ruta: string) => {
    // PASO 1: Validar datos y agrupar por cliente
    const clientesMap = new Map<string, CSVRow[]>();
    const pedidosMap = new Map<string, { cliente: string, campania: string, entregas: Map<string, CSVRow[]> }>();
    const entregasGlobales = new Map<string, { pedidoKey: string, numeroEntrega: number, productos: CSVRow[] }>();

    data.forEach(row => {
        // Validar que numeroEntrega sea un número válido
        const numeroEntrega = parseInt(row.numeroEntrega);
        if (isNaN(numeroEntrega)) {
            throw new Error(`Número de entrega inválido: ${row.numeroEntrega} para cuenta ${row.nroCuenta}`);
        }

        // Validar que nroCuenta sea un número válido
        const nroCuenta = parseInt(row.nroCuenta);
        if (isNaN(nroCuenta)) {
            throw new Error(`Número de cuenta inválido: ${row.nroCuenta}`);
        }

        // Agrupar por cliente
        if (!clientesMap.has(row.nroCuenta)) {
            clientesMap.set(row.nroCuenta, []);
        }
        clientesMap.get(row.nroCuenta)!.push(row);

        // Agrupar por cliente y campaña para pedidos
        const pedidoKey = `${row.nroCuenta}-${row.campania}`;
        if (!pedidosMap.has(pedidoKey)) {
            pedidosMap.set(pedidoKey, {
                cliente: row.nroCuenta,
                campania: row.campania,
                entregas: new Map()
            });
        }

        // Agrupar entregas por número de entrega
        const entregaKey = row.numeroEntrega;
        if (!pedidosMap.get(pedidoKey)!.entregas.has(entregaKey)) {
            pedidosMap.get(pedidoKey)!.entregas.set(entregaKey, []);
        }
        pedidosMap.get(pedidoKey)!.entregas.get(entregaKey)!.push(row);

        // Agrupar entregas globalmente (para evitar duplicados)
        if (!entregasGlobales.has(entregaKey)) {
            entregasGlobales.set(entregaKey, {
                pedidoKey: pedidoKey,
                numeroEntrega: numeroEntrega,
                productos: []
            });
        }
        entregasGlobales.get(entregaKey)!.productos.push(row);
    });

    console.log(`Procesando ${clientesMap.size} clientes para zona: ${zona}, ruta: ${ruta}`);
    console.log(`Se crearán ${pedidosMap.size} pedidos únicos`);
    console.log(`Se crearán ${entregasGlobales.size} entregas únicas`);

    // PASO 2: Crear o buscar clientes
    const clientesCreados = new Map<string, Cliente>();

    for (const [nroCuenta, productos] of clientesMap) {
        const nroCuentaNum = parseInt(nroCuenta);

        // Buscar o crear cliente por número de cuenta
        let cliente = await Cliente.findOne({
            where: {
                nroCuenta: nroCuentaNum,
                zona: zona
            }
        });

        if (!cliente) {
            // Crear cliente con nombre genérico
            const nombreCliente = `Cliente_${nroCuenta}`;
            cliente = await Cliente.create({
                firstName: nombreCliente,
                lastName: nombreCliente,
                nroCuenta: nroCuentaNum,
                zona: zona
            });
            console.log(`Cliente creado: ${nombreCliente} (Cuenta: ${nroCuenta}) en zona ${zona}`);
        } else {
            console.log(`Cliente encontrado: ${cliente.firstName} (Cuenta: ${nroCuenta}) en zona ${zona}`);
        }

        clientesCreados.set(nroCuenta, cliente);
    }

    // PASO 3: Crear pedidos (un pedido por cliente por campaña)
    const pedidosCreados = new Map<string, Pedido>();

    for (const [pedidoKey, pedidoData] of pedidosMap) {
        const cliente = clientesCreados.get(pedidoData.cliente);
        if (!cliente) {
            throw new Error(`Cliente no encontrado para cuenta: ${pedidoData.cliente}`);
        }

        // Crear pedido
        const pedido = await Pedido.create({
            clienteId: cliente.clienteId,
            campania: pedidoData.campania,
            zona: zona.toString(),
            fecha_creacion: new Date()
        });

        pedidosCreados.set(pedidoKey, pedido);
        console.log(`Pedido creado: ID ${pedido.pedidoId} para cliente ${cliente.firstName} (Campaña: ${pedidoData.campania})`);
    }

    // PASO 4: Crear entregas únicas y productos
    const entregasCreadas = new Map<string, Entrega>();

    for (const [numeroEntrega, entregaData] of entregasGlobales) {
        const pedido = pedidosCreados.get(entregaData.pedidoKey);
        if (!pedido) {
            throw new Error(`Pedido no encontrado para key: ${entregaData.pedidoKey}`);
        }

        // Verificar si la entrega ya existe
        let entrega = await Entrega.findOne({
            where: { nroEntrega: entregaData.numeroEntrega }
        });

        if (!entrega) {
            // Crear entrega única
            entrega = await Entrega.create({
                pedidoId: pedido.pedidoId,
                nroEntrega: entregaData.numeroEntrega,
                estado: 'PENDIENTE',
                timestamp_inicio: new Date(),
                timestamp_fin: new Date()
            });

            console.log(`Entrega creada: Número ${entregaData.numeroEntrega} para pedido ${pedido.pedidoId}`);
        } else {
            console.log(`Entrega existente encontrada: Número ${entregaData.numeroEntrega}`);
        }

        entregasCreadas.set(numeroEntrega, entrega);

        // Crear productos de entrega
        for (const producto of entregaData.productos) {
            // Validar y convertir cantidad
            const cantidad = producto.cantidad ? parseInt(producto.cantidad) : 1;
            if (isNaN(cantidad) || cantidad <= 0) {
                throw new Error(`Cantidad inválida: ${producto.cantidad} para producto ${producto.codigoProducto}`);
            }

            await EntregaProducto.create({
                nroEntrega: entregaData.numeroEntrega,
                puesto: producto.estacion,        // argentina - Estación
                nivel: producto.nivel,           // A - Nivel
                ubicacion: producto.ubicacion,   // 001 - Ubicación
                cantidad: cantidad,              // 2 - Cantidad
                ean: producto.codigoProducto,    // 32233 - Código de producto/EAN
                estado: 'PENDIENTE',
                timestamp_scan: new Date(),
                user_scan: 'SISTEMA'
            });
        }

        console.log(`${entregaData.productos.length} productos agregados a la entrega ${entregaData.numeroEntrega}`);
    }

    console.log(`Proceso completado: ${clientesMap.size} clientes, ${pedidosMap.size} pedidos, ${entregasGlobales.size} entregas únicas procesadas`);
};

// Endpoint adicional para obtener estadísticas de carga por zona
const getZoneStats = async (req: Request, res: Response) => {
    try {
        const { zona } = req.params;
        const zonaNumber = parseInt(zona);

        if (isNaN(zonaNumber)) {
            return res.status(400).json({ error: 'La zona debe ser un número válido' });
        }

        const pedidosCount = await Pedido.count({ where: { zona: zona.toString() } });
        const clientesCount = await Cliente.count({ where: { zona: zonaNumber } });

        const entregasCount = await Entrega.count({
            include: [{
                model: Pedido,
                where: { zona: zona.toString() },
                attributes: []
            }]
        });

        const productosCount = await EntregaProducto.count({
            include: [{
                model: Entrega,
                include: [{
                    model: Pedido,
                    where: { zona: zona.toString() },
                    attributes: []
                }]
            }]
        });

        res.json({
            zona: zonaNumber,
            estadisticas: {
                pedidos: pedidosCount,
                clientes: clientesCount,
                entregas: entregasCount,
                productos: productosCount
            }
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Error al obtener estadísticas',
            details: error.message
        });
    }
};

// Endpoint para verificar las relaciones entre tablas
const getRelationships = async (req: Request, res: Response) => {
    try {
        const { zona } = req.params;
        const zonaNumber = parseInt(zona);

        if (isNaN(zonaNumber)) {
            return res.status(400).json({ error: 'La zona debe ser un número válido' });
        }

        // Obtener clientes con sus pedidos, entregas y productos
        const clientes = await Cliente.findAll({
            where: { zona: zonaNumber },
            include: [{
                model: Pedido,
                where: { zona: zona.toString() },
                include: [{
                    model: Entrega,
                    include: [{
                        model: EntregaProducto
                    }]
                }]
            }]
        });

        const resultado = clientes.map(cliente => ({
            clienteId: cliente.clienteId,
            nombre: `${cliente.firstName} ${cliente.lastName}`,
            nroCuenta: cliente.nroCuenta,
            zona: cliente.zona,
            pedidos: (cliente as any).pedidos?.map((pedido: any) => ({
                pedidoId: pedido.pedidoId,
                campania: pedido.campania,
                zona: pedido.zona,
                entregas: pedido.entregas?.map((entrega: any) => ({
                    entregaId: entrega.entregaId,
                    nroEntrega: entrega.nroEntrega,
                    estado: entrega.estado,
                    productos: entrega.productos?.map((producto: any) => ({
                        entregaProductoId: producto.entregaProductoId,
                        puesto: producto.puesto,
                        nivel: producto.nivel,
                        ubicacion: producto.ubicacion,
                        cantidad: producto.cantidad,
                        ean: producto.ean,
                        estado: producto.estado
                    }))
                }))
            }))
        }));

        res.json({
            zona: zonaNumber,
            relaciones: resultado
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Error al obtener relaciones',
            details: error.message
        });
    }
};

export default { uploadCSV, getZoneStats, getRelationships }; 