import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar"; // Sesuaikan jika folder components ada di luar
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Package, TrendingUp, Users, Loader2 } from "lucide-react";

export default function Dashboard() {
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/barang", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Pastikan res.data adalah array agar tidak error saat .map()
        setBarang(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Responsif */}
      <Sidebar />

      {/* Konten Utama */}
      <main className="flex-1 transition-all duration-300 ml-0 lg:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header (Margin top 14 di HP agar tidak tertutup tombol menu) */}
          <header className="mb-8 mt-14 lg:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Ringkasan Gudang
            </h1>
            <p className="text-slate-500">Selamat datang kembali, Admin.</p>
          </header>

          {/* Kartu Statistik (1 kolom di HP, 3 kolom di Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-blue-600 text-white shadow-lg border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Barang
                </CardTitle>
                <Package size={20} className="opacity-70" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{barang.length} Item</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Barang Keluar
                </CardTitle>
                <TrendingUp size={20} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-800">45</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Bulan ini
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">
                  User Aktif
                </CardTitle>
                <Users size={20} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-800">3 Admin</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabel Stok Barang */}
          <Card className="shadow-sm border-none overflow-hidden bg-white">
            <CardHeader className="border-b bg-white p-6">
              <CardTitle className="text-lg font-semibold text-slate-700">
                Stok Barang Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold py-4">
                        Nama Barang
                      </TableHead>
                      <TableHead className="font-bold py-4">Kategori</TableHead>
                      <TableHead className="text-right font-bold py-4">
                        Stok
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-12 text-slate-400"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Loader2
                              className="animate-spin text-blue-600"
                              size={32}
                            />
                            <span>Menghubungkan ke server...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : barang.length > 0 ? (
                      barang.map((item) => (
                        <TableRow
                          key={item.id}
                          className="hover:bg-slate-50/80 transition-colors border-b last:border-0"
                        >
                          <TableCell className="font-medium text-slate-700 py-4">
                            {item.nama}
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 uppercase">
                              {item.nama_group || "Umum"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-800 py-4">
                            {item.stok}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-12 text-slate-400"
                        >
                          Belum ada data barang tersedia.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
