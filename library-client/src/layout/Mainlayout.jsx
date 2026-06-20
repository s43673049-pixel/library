import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Navbar />
        <main>{children}</main>
      </div>
    </div>
  );
}