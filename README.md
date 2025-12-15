# Biteti SmartFlow CRM 🚀

Um CRM Inteligente focado em qualificação de leads e automação de abordagem de vendas.

O projeto utiliza **Inteligência Artificial Generativa** para analisar a dor do cliente (Pain Point) e gerar scripts de vendas personalizados em tempo real.

🔗 **[Acesse a Demo Online aqui](COLQUE_SEU_LINK_DA_VERCEL_AQUI)**

![Status](https://img.shields.io/badge/Status-MVP%20Complete-green)

## ✨ Funcionalidades Principais

1.  **Gestão de Leads:** Cadastro completo com nome, empresa, ramo e urgência declarada.
2.  **Análise de "Dor" (Pain Point Analysis):** O usuário descreve o desafio do cliente e a IA interpreta.
3.  **Scoring de Urgência via IA:** O Gemini compara a urgência que o usuário sente vs. a urgência real baseada na gravidade do problema.
4.  **Gerador de Scripts (Copywriting):** Gera automaticamente uma mensagem de abordagem para WhatsApp focada em resolver o problema específico do lead.

## 🛠 Tech Stack & Decisões Arquiteturais

### Frontend
- **React + Vite + TypeScript:** Para performance e tipagem segura.
- **Tailwind CSS:** Para estilização rápida e responsiva.
- **Lucide React:** Ícones modernos e leves.

### Backend & Dados
- **Supabase (PostgreSQL):** Persistência dos leads em tempo real.
- **RLS (Row Level Security):** Configurado para proteção de dados.

### Inteligência Artificial
- **Google Gemini 1.5 Flash:** Modelo escolhido pela baixa latência e alta capacidade de raciocínio lógico para vendas.

---

## 🧠 Nota sobre a Arquitetura (MVP vs Produção)

Para este MVP e visando a entrega rápida (Hackathon mode), a integração com a IA foi implementada no **Client-Side**.

**Roadmap para V2 (Arquitetura Ideal):**
Em um cenário de produção real, a lógica da IA seria migrada para **Supabase Edge Functions**.
- **Por que?** Para proteger a API Key do Google e reduzir o processamento no dispositivo do usuário.
- **Estrutura:** O Frontend enviaria os dados para a Edge Function -> A Function chamaria o Gemini -> E salvaria o resultado no Banco de Dados diretamente.

---

## 🚀 Como rodar localmente

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/SEU_USUARIO/biteti-smartflow-crm.git
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Configure as variáveis de ambiente:
Crie um arquivo \`.env\` na raiz com:
\`\`\`env
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave
VITE_GEMINI_API_KEY=sua_chave_ia
\`\`\`

4. Rode o projeto:
\`\`\`bash
npm run dev
\`\`\`

---

Desenvolvido como projeto prático de integração Frontend + AI + BaaS.