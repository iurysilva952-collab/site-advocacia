import { useState, useEffect, useRef } from "react";

import {
  useGetLawyers,
  useCreateLawyer,
  useUpdateLawyer,
} from "@workspace/api-client-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Mail,
  MoreVertical,
  Plus,
  Camera,
} from "lucide-react";

// -----------------------------------------------------------------------
// Labels em português para os campos do formulário
// -----------------------------------------------------------------------

const FIELD_LABELS: Record<string, string> = {
  name: "Nome Completo",
  oab: "OAB",
  ufOab: "UF da OAB",
  cpf: "CPF",
  rg: "RG",
  phone: "Telefone",
  email: "Email",
  specialty: "Especialidade",
  role: "Cargo",
};

const EMPTY_FORM = {
  name: "",
  oab: "",
  ufOab: "",
  cpf: "",
  rg: "",
  phone: "",
  email: "",
  specialty: "",
  role: "",
  avatarUrl: "",
};

export default function Lawyers() {
  const { data: lawyersData, isLoading } = useGetLawyers();

const createLawyer = useCreateLawyer();
const updateLawyer = useUpdateLawyer();

  const [lawyers, setLawyers] = useState<any[]>([]);

  useEffect(() => {
    if (lawyersData) {
      setLawyers(lawyersData);
    }
  }, [lawyersData]);

  const [openCreate, setOpenCreate] = useState(false);

  const [selectedLawyer, setSelectedLawyer] = useState<any>(null);

  const [mode, setMode] = useState<"create" | "view" | "edit" | null>(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChange(field: string, value: string) {
    setForm({
      ...form,
      [field]: value,
    });
  }

  // -----------------------------------------------------------------------
  // Upload de foto: converte o arquivo escolhido em base64 e guarda no form
  // -----------------------------------------------------------------------
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        avatarUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  }

 function handleCreate() {
  createLawyer.mutate(
    {
      data: {
        ...form,
        password: "123456",
        isAdmin: false,
      },
    },
    {
      onSuccess: () => {
        console.log("SUCESSO");

        setOpenCreate(false);
        setForm({ ...EMPTY_FORM });
      },

      onError: (error) => {
        console.log("ERRO:", error);
      },
    }
  );
}
  function openNewLawyerModal() {
    setSelectedLawyer(null);
    setForm({ ...EMPTY_FORM });
    setMode("create");
    setOpenCreate(true);
  }

  function openEditModal(lawyer: any) {
    setForm({
      name: lawyer.name || "",
      oab: lawyer.oab || "",
      ufOab: lawyer.ufOab || "",
      cpf: lawyer.cpf || "",
      rg: lawyer.rg || "",
      phone: lawyer.phone || "",
      email: lawyer.email || "",
      specialty: lawyer.specialty || "",
      role: lawyer.role || "",
      avatarUrl: lawyer.avatarUrl || "",
    });

    setSelectedLawyer(lawyer);
    setMode("edit");
    setOpenCreate(true);
  }

  if (isLoading) {
    return (
      <div className="text-center py-20 text-zinc-500">Carregando...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            Corpo Jurídico
          </h1>

          <p className="text-zinc-400">
            Gestão de advogados associados e sócios
          </p>
        </div>

        <Button
          onClick={openNewLawyerModal}
          className="
          bg-amber-600
          hover:bg-amber-700
          "
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Advogado
        </Button>
      </div>

      {/* LISTA DOS ADVOGADOS */}
      <div className="
      grid
      grid-cols-1
      md:grid-cols-2
      xl:grid-cols-3
      gap-6
      ">
        {lawyers.map((lawyer) => (
          <Card
            key={lawyer.id}
            className="
            bg-[#121214]
            border-zinc-800
            overflow-hidden
            "
          >
            <CardHeader className="relative">
              <div className="
              absolute
              top-4
              right-4
              flex
              gap-2
              ">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-zinc-400">
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="
                    bg-zinc-900
                    border-zinc-800
                    "
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedLawyer(lawyer);
                        setMode("view");
                      }}
                    >
                      Ver informações
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => openEditModal(lawyer)}>
                      Editar
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => {
                        setLawyers(
                          lawyers.filter((item) => item.id !== lawyer.id)
                        );
                      }}
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="
              flex
              items-center
              gap-4
              ">
                <Avatar
                  className="
                  w-16
                  h-16
                  border-2
                  border-zinc-800
                  "
                >
                  <AvatarImage src={lawyer.avatarUrl} />

                  <AvatarFallback
                    className="
                    bg-zinc-900
                    text-zinc-400
                    text-lg
                    "
                  >
                    {lawyer.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <CardTitle
                    className="
                    text-lg
                    text-white
                    "
                  >
                    {lawyer.name}
                  </CardTitle>

                  <p className="text-sm text-zinc-500">
                    {lawyer.specialty || "Advogado"}
                  </p>

                  <p className="text-xs text-zinc-600">OAB: {lawyer.oab}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent
              className="
              bg-zinc-950/50
              border-t
              border-zinc-800
              "
            >
              <div className="
              flex
              items-center
              gap-2
              text-sm
              text-zinc-400
              ">
                <Mail className="w-4 h-4" />
                {lawyer.email}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL CADASTRO / EDITAR */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent
          className="
          bg-[#121214]
          border-zinc-800
          text-white
          "
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" && selectedLawyer
                ? "Editar Advogado"
                : "Novo Advogado"}
            </DialogTitle>
          </DialogHeader>

          {/* FOTO */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="relative">
              <Avatar className="w-20 h-20 border-2 border-zinc-800">
                <AvatarImage src={form.avatarUrl} />
                <AvatarFallback className="bg-zinc-900 text-zinc-400 text-xl">
                  {form.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="
                absolute
                -bottom-1
                -right-1
                bg-amber-600
                hover:bg-amber-700
                rounded-full
                p-1.5
                border-2
                border-[#121214]
                "
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <span className="text-xs text-zinc-500">
              Clique no ícone para adicionar uma foto
            </span>
          </div>

          <div className="
          grid
          grid-cols-2
          gap-4
          ">
            {Object.entries(form)
              .filter(([key]) => key !== "avatarUrl")
              .map(([key, value]) => (
                <div key={key}>
                  <Label>{FIELD_LABELS[key] || key}</Label>

                  <Input
                    className="bg-zinc-900"
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                </div>
              ))}
          </div>

          <Button
            className="
            bg-amber-600
            mt-4
            "
            onClick={() => {
              if (mode === "edit" && selectedLawyer) {
                setLawyers(
                  lawyers.map((item) =>
                    item.id === selectedLawyer.id
                      ? {
                          ...item,
                          ...form,
                        }
                      : item
                  )
                );

                setOpenCreate(false);
                setForm({ ...EMPTY_FORM });
              } else {
                handleCreate();
              }
            }}
          >
            Salvar
          </Button>
        </DialogContent>
      </Dialog>

      {/* MODAL VER INFORMAÇÕES */}
      <Dialog open={mode === "view"} onOpenChange={() => setMode(null)}>
        <DialogContent
          className="
          bg-[#121214]
          text-white
          "
        >
          <DialogHeader>
            <DialogTitle>Informações do Advogado</DialogTitle>
          </DialogHeader>

          {selectedLawyer && (
            <div className="space-y-3">
              <div className="flex justify-center mb-2">
                <Avatar className="w-20 h-20 border-2 border-zinc-800">
                  <AvatarImage src={selectedLawyer.avatarUrl} />
                  <AvatarFallback className="bg-zinc-900 text-zinc-400 text-xl">
                    {selectedLawyer.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <p>Nome: {selectedLawyer.name}</p>
              <p>OAB: {selectedLawyer.oab}</p>
              <p>UF da OAB: {selectedLawyer.ufOab}</p>
              <p>CPF: {selectedLawyer.cpf}</p>
              <p>RG: {selectedLawyer.rg}</p>
              <p>Telefone: {selectedLawyer.phone}</p>
              <p>Email: {selectedLawyer.email}</p>
              <p>Especialidade: {selectedLawyer.specialty}</p>
              <p>Cargo: {selectedLawyer.role}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}