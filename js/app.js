const form = document.getElementById('loginForm');

form.addEventListener('submit', function(e){
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Demo credentials
  if(email === 'admin@cms.com' && password === '123456'){
    localStorage.setItem('cmsLogin', 'true');
    window.location.href = 'dashboard.html';
  }else{
    alert('Invalid email or password');
  }
});

