Mimport React, { useEffect, useState } from "react";

// --- DADOS DO PRODUTO (dinâmicos, facilmente editáveis) ---
const PRODUCT = {
  title: "Tênis de Corrida Ultra",
  price: 349.9,
  images: [
    // Imagens de domínio livre, pode trocar as URLs
    "https://images.unsplash.com/photo-1517263904808-5dc0d6d7b6c2?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1526178613658-3b642d1b3c97?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  ],
  variants: {
    size: ["36", "37", "38", "39", "40", "41", "42"],
    color: ["Preto", "Azul", "Vermelho"],
  },
};

const STORAGE_KEY = "ecommerce-product-page";

export default function ProductPage() {
  // --- ESTADOS PRINCIPAIS ---
  const [mainImg, setMainImg] = useState(PRODUCT.images[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState(null);
  const [cepError, setCepError] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);

  // --- Carrega dados do localStorage se válidos (até 15 min) ---
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Date.now() - saved.timestamp < 15 * 60 * 1000) {
      setMainImg(saved.mainImg || PRODUCT.images[0]);
      setSelectedSize(saved.selectedSize);
      setSelectedColor(saved.selectedColor);
      setCep(saved.cep || "");
      setEndereco(saved.endereco || null);
    }
  }, []);

  // --- Salva no localStorage toda vez que mudar algo importante ---
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mainImg,
        selectedSize,
        selectedColor,
        cep,
        endereco,
        timestamp: Date.now(),
      })
    );
  }, [mainImg, selectedSize, selectedColor, cep, endereco]);

  // --- Função para buscar endereço pelo CEP ---
  const buscarCep = async (cepInput) => {
    setCepError("");
    setEndereco(null);
    setLoadingCep(true);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepInput}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado.");
        setEndereco(null);
      } else {
        setEndereco(data);
      }
    } catch (e) {
      setCepError("Erro ao consultar CEP.");
      setEndereco(null);
    }
    setLoadingCep(false);
  };

  // --- Handler do input de CEP ---
  const handleCepChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setCep(value);
    setCepError("");
    setEndereco(null);

    // Consulta automática ao digitar 8 dígitos
    if (value.length === 8) buscarCep(value);
  };

  // --- Layout principal ---
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Lado esquerdo: Imagens */}
        <div className="w-full md:w-[35%] bg-gray-50 flex flex-col items-center p-6">
          <img
            src={mainImg}
            alt="Produto"
            className="w-full h-64 object-contain rounded-xl mb-4 border"
          />
          {/* Miniaturas */}
          <div className="flex gap-2">
            {PRODUCT.images.map((img) => (
              <img
                key={img}
                src={img}
                alt="Miniatura"
                onClick={() => setMainImg(img)}
                className={`w-14 h-14 object-contain border-2 rounded-lg cursor-pointer ${
                  mainImg === img
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
        {/* Lado direito: Infos do produto */}
        <div className="w-full md:w-[65%] p-8 flex flex-col gap-6">
          {/* Título e Preço */}
          <div>
            <h1 className="text-2xl font-bold mb-1">{PRODUCT.title}</h1>
            <span className="text-2xl font-semibold text-green-600">
              R$ {PRODUCT.price.toFixed(2).replace(".", ",")}
            </span>
          </div>
          {/* Seletores de variantes */}
          <div className="flex gap-6 flex-col sm:flex-row">
            {/* Tamanho */}
            <div>
              <label className="font-semibold">Tamanho:</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {PRODUCT.variants.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1 rounded-lg border transition-all ${
                      selectedSize === size
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            {/* Cor */}
            <div>
              <label className="font-semibold">Cor:</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {PRODUCT.variants.color.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1 rounded-lg border transition-all ${
                      selectedColor === color
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Disponibilidade de Entrega */}
          <div>
            <label className="font-semibold">Consultar frete:</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={cep}
                onChange={handleCepChange}
                className="border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 w-32"
                placeholder="Digite o CEP"
              />
              {loadingCep && (
                <span className="ml-2 text-blue-600 text-sm animate-pulse">
                  Buscando...
                </span>
              )}
            </div>
            {/* Exibe endereço ou erro */}
            <div className="mt-2 min-h-[24px]">
              {cepError && (
                <span className="text-red-500 text-sm">{cepError}</span>
              )}
              {endereco && (
                <span className="block text-gray-800 text-sm">
                  {endereco.logradouro}, {endereco.bairro}
                  <br />
                  {endereco.localidade} - {endereco.uf}
                </span>
              )}
            </div>
          </div>
          {/* Botão de Comprar */}
          <div className="mt-4">
            <button
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold w-full shadow hover:bg-green-700 transition-all disabled:opacity-50"
              disabled={
                !selectedSize || !selectedColor || !cep || !endereco
              }
              onClick={() =>
                alert("Compra simulada!\nEsse é um teste front-end 😃")
              }
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
      {/* Rodapé fixo de referência */}
      <div className="fixed bottom-2 right-2 bg-white px-3 py-1 text-xs text-gray-500 rounded shadow">
        Teste técnico | Desenvolvido por [Seu Nome]
      </div>
    </div>
  );
}
