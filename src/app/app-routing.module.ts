import { HomeComponent } from './components/home.component';
import { NgModule } from '@angular/core';
import type { Routes} from '@angular/router';
import { RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
