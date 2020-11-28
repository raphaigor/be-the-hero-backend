const conection = require('../database/con');

module.exports = {

    async index(request, response) {

        const { page = 1 } = request.query;

        const [count] = await conection('incidents').count();

        const incidents = await conection('incidents')
            .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
            .limit(5)
            .offset((page -1) * 5)
            .select(['incidents.*', 'ongs.name', 'ongs.whatsapp', 'ongs.email', 'ongs.city', 'ongs.uf']);
        
        response.header('X-Total-Count', count['count(*)']);

        return response.json(incidents);
    },

    async create(request, response) {
        
        const {title, description, value} = request.body;
        const ong_id = request.headers.authorization;

        const [id] = await conection('incidents').insert({
            title,
            description,
            value,
            ong_id,
        });

        return response.json({id});
    },

    async delete(request, response) {
    
        const {id} = request.params;
        const ong_id = request.headers.authorization;

        const incident = await conection('incidents')
            .where('id', id)
            .select('ong_id')
            .first();

        if (incident.ong_id !== ong_id) {
            return response.status(401).json({error: "Operação não permitida!"})
        }

        await conection('incidents').where('id', id).delete();

        return response.status(204).send();
    },
};