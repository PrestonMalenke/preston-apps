import DashboardBootScaffold from './DashboardBootScaffold'
import StructuralScaffold from './StructuralScaffold'
export default function StructuralPageLoader({label='Loading data',type='ledger',fullPage=false}){
return fullPage ? <DashboardBootScaffold label={label}/> : <StructuralScaffold type={type} label={label}/>
}