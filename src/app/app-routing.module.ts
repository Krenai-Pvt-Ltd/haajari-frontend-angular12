import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorPageComponent } from './modules/common/error-page/error-page.component';
import { HajiriPageLoaderComponent } from './modules/common/hajiri-page-loader/hajiri-page-loader.component';

const routes: Routes = [

  { path: '', redirectTo: '/login', pathMatch:'full'},
  { path: '', loadChildren: () => import('./modules/dynamic/dynamic.module').then(m => m.DynamicModule) },
  { path: '**', component : ErrorPageComponent},
  

  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
