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
  FaBoxTissue,
  FaBoxOpen,
  FaCog,
} from "react-icons/fa";

export const getSidebarItems = (router) => [
  {
    label: "Inicio",
    icon: <FaHome />,
    onClick: () => router.push("/dashboard"),
  },
  {
    label: "Empleados",
    icon: <FaUsers />,
    onClick: () => router.push("/employees"),
  },
  {
    label: "Inventario",
    icon: <FaBoxes />,
    dropdown: [
      { label: "Productos", icon: <FaList />, onClick: () => router.push("/products") },
      { label: "Stock", icon: <FaBoxOpen />, onClick: () => router.push("/stock") },
      { label: "Depósitos", icon: <FaWarehouse />, onClick: () => router.push("/wharehouses") },
    ],
  },
  { label: "Proveedores", icon: <FaTruck />, onClick: () => router.push("/suppliers") },
  { label: "CRM", icon: <FaChartLine />, onClick: () => router.push("/crm") },
  {
    label: "Administración",
    icon: <FaTools />,
    dropdown: [
      { label: "Ventas", icon: <FaHandshake />, onClick: () => router.push("/admin/sales") },
      { label: "Compras", icon: <FaPlus />, onClick: () => router.push("/admin/purchases") },
      { label: "Estadísticas", icon: <FaChartLine />, onClick: () => router.push("")  }
    ],
  },
  { label: "Facturación", icon: <FaFileInvoiceDollar />, onClick: () => router.push("/billing") },
  {
    label: "Ecommerce",
    icon: <FaStore />,
    dropdown: [
      { label: "Configurar tienda", icon: <FaCog />, onClick: () => router.push("/store/conf") },
      { label: "Métodos de pago", icon: <FaMoneyCheckAlt />, onClick: () => router.push("/ecommerce/payments") },
      { label: "Métodos de envío", icon: <FaShippingFast />, onClick: () => router.push("/ecommerce/shipping") },
    ],
  },
];
