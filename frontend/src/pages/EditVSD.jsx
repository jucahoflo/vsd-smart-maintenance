import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { actualizarVSD } from '../services/vsdService';

export default function EditVSD() {
  const { codigo_vsd } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vsdData, setVsdData] = useState({
    codigo_vsd: '',
    nombre: '',
    modelo: '',
    estado: 'offline',
    potencia: '',
    voltaje: '',
    kva: '',
    health_score: 100
  });

  useEffect(() => {
    const loadVSD = async () => {
      const { data, error } = await supabase
        .from('vsd')
        .select('*')
        .eq('codigo_vsd', codigo_vsd)
        .single();
      if (error) console.error(error);
      if (data) setVsdData(data);
      setLoading(false);
    };
    loadVSD();
  }, [codigo_vsd]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVsdData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await actualizarVSD(vsdData);
    navigate(`/vsds/${vsdData.codigo_vsd}`);
  };

  if (loading) return <div>Cargando datos del VSD...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editar VSD</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Código VSD</label>
          <input
            type="text"
            name="codigo_vsd"
            value={vsdData.codigo_vsd}
            disabled
            className="w-full p-2 border rounded bg-gray-200 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={vsdData.nombre}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Modelo</label>
          <input
            type="text"
            name="modelo"
            value={vsdData.modelo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            name="estado"
            value={vsdData.estado}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Potencia (kW)</label>
            <input
              type="text"
              name="potencia"
              value={vsdData.potencia || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Voltaje (V)</label>
            <input
              type="text"
              name="voltaje"
              value={vsdData.voltaje || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">KVA</label>
            <input
              type="text"
              name="kva"
              value={vsdData.kva || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
