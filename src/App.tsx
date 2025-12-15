import { useState, useEffect } from 'react';
import { supabase } from './supabase';
// Voltando para a biblioteca que funcionou para você
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Rocket, Loader2, Send, Trash2, User, Building2, AlertCircle, Mail, Target } from 'lucide-react';

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  business_type: string;
  challenge: string;
  user_urgency: string;
  ai_urgency: string;
  ai_message: string;
  status: string;
}

function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  // Formulário completo
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', businessType: '', challenge: '', urgency: 'Média'
  });

  // Inicialização Clássica (A que funcionou antes)
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Erro ao buscar:', error);
    else setLeads(data || []);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TENTATIVA 1: O modelo padrão mais rápido
      // Se este der erro 404, trocaremos apenas o nome aqui
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `
        Atue como um SDR Sênior.
        Analise este lead:
        - Nome: ${formData.name}
        - Empresa: ${formData.company} (${formData.businessType})
        - Principal Desafio: ${formData.challenge}
        - Urgência Declarada: ${formData.urgency}
        
        Sua tarefa:
        1. Classifique a "ai_urgency" (Alta/Média/Baixa).
        2. Escreva uma mensagem de WhatsApp curta e vendedora focada na dor.

        Retorne APENAS um JSON válido neste formato (sem markdown):
        { "ai_urgency": "Alta", "message": "Olá..." }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Limpeza robusta para evitar erro de JSON
      const text = response.text().replace(/```json|```/g, '').trim();
      const aiData = JSON.parse(text);

      // 2. Salvar no Supabase
      const { error } = await supabase.from('leads').insert([
        {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          business_type: formData.businessType,
          challenge: formData.challenge,
          user_urgency: formData.urgency,
          ai_urgency: aiData.ai_urgency || 'Média',
          ai_message: aiData.message || 'Erro ao gerar mensagem',
          status: 'Novo'
        }
      ]);

      if (error) throw error;

      setFormData({
        name: '', email: '', company: '', businessType: '', challenge: '', urgency: 'Média'
      });
      fetchLeads();

    } catch (error) {
      console.error('Erro detalhado:', error);
      alert('Erro na IA. Veja o console (F12) para detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (id: number) => {
    await supabase.from('leads').delete().match({ id });
    fetchLeads();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto font-sans bg-gray-50">
      <header className="mb-8 flex items-center gap-4 border-b pb-6">
        <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
          <Rocket className="text-white w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biteti SmartFlow CRM</h1>
          <p className="text-gray-500">Sistema Inteligente de Qualificação de Leads</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Formulário Completo */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-4">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-800">
              <User className="w-5 h-5 text-indigo-600" /> Novo Lead
            </h2>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} 
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="Ex: Ana Souza" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input name="email" value={formData.email} onChange={handleInputChange} 
                    className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="ana@empresa.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Empresa</label>
                  <input required name="company" value={formData.company} onChange={handleInputChange} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="TechSolutions" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Ramo</label>
                  <input required name="businessType" value={formData.businessType} onChange={handleInputChange} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="Varejo" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Urgência (Manual)</label>
                <select name="urgency" value={formData.urgency} onChange={handleInputChange}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-pointer">
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Target className="w-3 h-3" /> Desafio Principal
                </label>
                <textarea required name="challenge" value={formData.challenge} onChange={handleInputChange} rows={3}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none resize-none" 
                  placeholder="Qual a dor do cliente?" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-bold flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Rocket className="w-5 h-5" /> Analisar Lead</>}
              </button>
            </form>
          </div>
        </div>

        {/* Lista Completa */}
        <div className="lg:col-span-8 space-y-4">
           <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Pipeline de Vendas</h2>
            <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">{leads.length} Leads</span>
          </div>
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all relative group">
              <button onClick={() => deleteLead(lead.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xl">{lead.company}</h3>
                    <span className="text-sm text-gray-500">({lead.name})</span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Building2 className="w-3 h-3" /> {lead.business_type} 
                    {lead.email && <span className="text-gray-400 mx-2">• {lead.email}</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                   <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Urgência User</span>
                    <span className="text-sm font-medium text-gray-600">{lead.user_urgency}</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200 mx-1"></div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                      <Rocket className="w-3 h-3" /> IA Score
                    </span>
                    <span className={`px-2 py-0.5 rounded text-sm font-bold 
                      ${lead.ai_urgency === 'Alta' ? 'bg-red-100 text-red-700' : 
                        lead.ai_urgency === 'Média' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-green-100 text-green-700'}`}>
                      {lead.ai_urgency}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <p className="text-xs font-bold text-orange-400 uppercase mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> O Desafio (Dor)
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed">{lead.challenge}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-400 uppercase mb-1 flex items-center gap-1">
                    <Send className="w-3 h-3" /> Sugestão da IA
                  </p>
                  <p className="text-gray-700 text-sm italic leading-relaxed">"{lead.ai_message}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;