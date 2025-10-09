"use client";
import React, { useState } from "react";

export default function CreateStoreOwnerForm({ onCreate }) {
    const [form, setForm] = useState({
        email: "",
        first_name: "",
        last_name: "",
        store_name: "",
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        
        try {
            if (onCreate) onCreate(form);
            setMsg("Dueño de tienda creado correctamente.");
            setForm({ email: "", first_name: "", last_name: "", store_name: "" });
        } catch (err) {
            setMsg("Error al crear el dueño de la tienda.");
        };

        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Crear dueño de tienda</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="border border-gray-300 rounded px-3 py-2 text-gray-900"
                value={form.email}
                onChange={handleChange}
                />
                <input
                name="first_name"
                required
                placeholder="Nombre"
                className="border border-gray-300 rounded px-3 py-2 text-gray-900"
                value={form.first_name}
                onChange={handleChange}
                />
                <input
                name="last_name"
                required
                placeholder="Apellido"
                className="border border-gray-300 rounded px-3 py-2 text-gray-900"
                value={form.last_name}
                onChange={handleChange}
                />
                <input
                name="store_name"
                required
                placeholder="Nombre de la tienda"
                className="border border-gray-300 rounded px-3 py-2 text-gray-900"
                value={form.store_name}
                onChange={handleChange}
                />
                <button
                type="submit"
                className="bg-[#18c29c] text-white px-6 py-2 rounded font-semibold hover:bg-[#15a884] transition"
                disabled={loading}
                >
                {loading ? "Creando..." : "Crear dueño"}
                </button>
                {msg && <div className="text-sm text-center text-gray-700">{msg}</div>}
            </form>
        </div>
    );
}