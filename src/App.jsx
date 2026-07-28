import { BrowserRouter , Routes , Route} from 'react-router';
import './App.css'
import Root from './utills/Root';
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoutes from '../src/utills/ProtectedRoutes'
import SuperAdmin from './pages/SuperAdmin';
import CustomerDashboard from './pages/CustomerDashboard';
function App() {

  return (
   <BrowserRouter>   
    <Routes>
        <Route path="/" element={<Root/>}/>
        <Route path="/superadmin/dashboard" element={
          <ProtectedRoutes requireRole={["superadmin"]}>
            <SuperAdmin/>
          </ProtectedRoutes>
        }/>
        <Route 
        path="/admin/dashboard" 
        element={
        <ProtectedRoutes requireRole={["admin"]}> 
         <AdminDashboard/>
         </ProtectedRoutes>
        }
        >
         <Route 
          index 
          element={<h1>Summary of Dashboard</h1>}
         />
         </Route>

         <Route path="/customer/dashboard" element={
          <ProtectedRoutes requireRole={["customer"]}>
            <CustomerDashboard/>
          </ProtectedRoutes>
         }/>

          <Route path="/unauthorized" element={<p className='font-bold text-3xl mt-20 ml-20'>unauthorized</p>}/>
          <Route path="/login" element={<Login/>}/>

    </Routes>
   </BrowserRouter>
  )
}

export default App;
