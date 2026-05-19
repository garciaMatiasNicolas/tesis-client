// sidebarItems.js
import {
  FaHome,
  FaUsers,
  FaList,
  FaPlus,
  FaBoxes,
  FaTools,
  FaFileInvoiceDollar,
  FaChartLine,
  FaStore,
  FaTruck,
  FaWarehouse,
  FaMoneyCheckAlt,
  FaShippingFast,
  FaHandshake,
  FaFolder,
  FaBoxOpen,
  FaCog,
  FaArrowsAltH
} from "react-icons/fa";

export const getSidebarItems = (router) => [
  {
    label: "Inicio",
    icon: <FaHome />,
    onClick: () => router.push("/dashboard"),
  },
  {
    label: "Inventario",
    icon: <FaBoxes />,
    dropdown: [
      { label: "Productos", icon: <FaList />, onClick: () => router.push("/products") },
      { label: "Unidades de Producto", icon: <FaBoxes />, onClick: () => router.push("/product-units") },
      { label: "Movimientos", icon: <FaArrowsAltH />, onClick: () => router.push("/movements") },
      { label: "Stock", icon: <FaBoxOpen />, onClick: () => router.push("/stock") },
      { label: "Depósitos", icon: <FaWarehouse />, onClick: () => router.push("/warehouses") },
      { label: "Proveedores", icon: <FaTruck />, onClick: () => router.push("/suppliers") },
      { label: "Categorías", icon: <FaFolder />, onClick: () => router.push("/categories") }
    ],
  },
  {
    label: "Administración",
    icon: <FaTools />,
    dropdown: [
      { label: "Ventas", icon: <FaHandshake />, onClick: () => router.push("/admin/sales") },
      { label: "Compras", icon: <FaPlus />, onClick: () => router.push("/admin/purchase") },
    ],
  },
  {
    label: "Ecommerce",
    icon: <FaStore />,
    dropdown: [
      { label: "Configurar tienda", icon: <FaCog />, onClick: () => router.push("/profile?section=store") },
    ],
  },
  { label: "Empleados", icon: <FaUsers />, onClick: () => router.push("/employees") },
  { label: "CRM", icon: <FaChartLine />, onClick: () => router.push("/crm") },
];
