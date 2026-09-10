const currentSession = JSON.parse(localStorage.getItem('ksucSession') || 'null');
const isAdminPage = location.pathname.toLowerCase().endsWith('admin.html');
if (!currentSession) {
  location.replace('login.html');
} else if (isAdminPage && currentSession.role !== 'Administrator') {
  location.replace('index.html');
}
