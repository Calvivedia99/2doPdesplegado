import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { TopbarComponent } from './shared/topbar/topbar.component';
import { ToastContainerComponent } from './shared/toast/toast-container.component';
import { AsistenteChatComponent } from './shared/asistente-chat/asistente-chat.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopbarComponent, ToastContainerComponent, AsistenteChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly auth = inject(AuthService);
}
