import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'pt-BR': {
    translation: {
      // Auth
      login: 'Entrar',
      email: 'E-mail',
      password: 'Senha',
      logout: 'Sair',
      
      // Navigation
      dashboard: 'Painel',
      scan: 'Escanear',
      categorias: 'Categorias',
      reports: 'Relatórios',
      settings: 'Configurações',
      
      // Boletos
      boletos: 'Boletos',
      fornecedor: 'Fornecedor',
      valor: 'Valor',
      vencimento: 'Vencimento',
      status: 'Status',
      categoria: 'Categoria',
      codigoBarras: 'Código de Barras',
      
      // Status
      PENDENTE: 'Pendente',
      VENCIDO: 'Vencido',
      PAGO: 'Pago',
      
      // Actions
      marcarPago: 'Marcar como Pago',
      anexarComprovante: 'Anexar Comprovante',
      salvar: 'Salvar',
      cancelar: 'Cancelar',
      filtrar: 'Filtrar',
      exportarCSV: 'Exportar CSV',
      
      // Messages
      successScan: 'Boleto escaneado com sucesso!',
      successPaid: 'Boleto marcado como pago!',
      errorScan: 'Erro ao escanear boleto',
      errorPaid: 'Erro ao marcar boleto como pago',
      
      // Scan page
      uploadBoleto: 'Enviar Boleto',
      dragDrop: 'Arraste e solte ou clique para selecionar',
      preview: 'Visualização',
      editData: 'Editar dados extraídos',
      
      // Reports
      gastoPorCategoria: 'Gastos por Categoria',
      totalPago: 'Total Pago',
      totalPendente: 'Total Pendente',
      
      // Alerts
      vencendoEm3Dias: 'Vencendo em 3 dias',
      
      // Settings
      changePassword: 'Alterar Senha',
      cnpj: 'CNPJ',
      darkMode: 'Modo Escuro',
      
      // Categories
      criarCategoria: 'Criar Categoria',
      criarCategoriaDescricao: 'Crie uma nova categoria para organizar seus boletos',
      editarCategoria: 'Editar Categoria',
      editarCategoriaDescricao: 'Edite os dados da categoria',
      nome: 'Nome',
      nomeCategoriaPlaceholder: 'Digite o nome da categoria',
      cor: 'Cor',
      corDescricao: 'Selecione uma cor para identificar esta categoria',
      gerenciarCategorias: 'Gerencie suas categorias de boletos',
      erroCarregarCategorias: 'Não foi possível carregar as categorias. Tente novamente.',
      nenhumaCategoria: 'Nenhuma categoria encontrada',
      criadoEm: 'Criado em',
      salvando: 'Salvando...',
      anterior: 'Anterior',
      proxima: 'Próxima',
      pagina: 'Página',
      de: 'de',
      acoes: 'Ações',
      editar: 'Editar',
      excluir: 'Excluir',
      excluindo: 'Excluindo...',
      confirmarExclusao: 'Confirmar Exclusão',
      confirmarExclusaoDescricao: 'Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.',
      coresPredefinidas: 'Cores Predefinidas',
      corPersonalizada: 'Cor Personalizada',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
