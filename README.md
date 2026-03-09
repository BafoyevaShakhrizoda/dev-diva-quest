# Dev Diva Quest

 **Empowering Women in IT** - An intelligent career platform for female developers to assess skills, build professional CVs, and discover matching job opportunities.

## **Features**

### **AI-Powered Skill Assessment**
- Comprehensive skill tests for Frontend, Backend, and Full Stack roles
- 12+ questions per category with adaptive difficulty levels
- Intelligent evaluation using AI analysis
- Personalized feedback and improvement recommendations

### **Smart Job Matching**
- Advanced algorithm matching skills to job requirements
- Role-based compatibility scoring (0-100%)
- AI-powered requirement analysis
- Personalized job recommendations

### **Professional CV Builder**
- AI-generated ATS-friendly resumes
- Multiple professional templates
- Real-time preview and editing
- Export capabilities

### **User Profile Management**
- Skill level tracking and certification
- Test history and progress monitoring
- Personal dashboard with insights
- Achievement badges and milestones

## **Tech Stack**

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Lucide React** - Icon library

### Backend
- **Django 5.0** - Python web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Primary database
- **SQLite** - Development database
- **OpenAI API** - AI integration
- **JWT Authentication** - Secure auth system

## **Quick Start**

### Prerequisites
- Node.js 18+
- Python 3.11+
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/BafoyevaShakhrizoda/dev-diva-quest.git
cd dev-diva-quest
```

2. **Frontend Setup**
```bash
npm install
npm run dev
```

3. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your OpenAI API key
python manage.py migrate
python manage.py load_questions
python manage.py load_jobs
python manage.py runserver
```

4. **Access the Application**
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## **Usage**

### For Developers
1. **Register** an account
2. **Take Skill Tests** in your domain
3. **Get AI Evaluation** with personalized feedback
4. **Build Your CV** using AI assistance
5. **Discover Jobs** matching your skill level

### For Companies
1. **Post Job Vacancies** with detailed requirements
2. **Get Matched** with qualified candidates
3. **Review Profiles** and skill assessments
4. **Connect** with potential hires

## **Skill Levels**

- **Beginner** (0-20%): Starting the journey
- **Junior** (21-40%): Basic knowledge and skills
- **Middle** (41-70%): Solid understanding and experience
- **Senior** (71-100%): Expert-level mastery

## **Deployment**

### DigitalOcean Deployment

1. **Prepare Your Environment**
```bash
# Install required tools
npm install -g @digitalocean/doctl
```

2. **Set Up Environment Variables**
```bash
export OPENAI_API_KEY=your_openai_key
export DATABASE_URL=your_database_url
export SECRET_KEY=your_django_secret
```

3. **Deploy Frontend (App Platform)**
```bash
# Build for production
npm run build

# Deploy to DigitalOcean App Platform
doctl apps create --spec .do/app.yaml
```

4. **Deploy Backend (Droplet)**
```bash
# SSH into your Droplet
ssh root@your-droplet-ip

# Clone and setup
git clone https://github.com/BafoyevaShakhrizoda/dev-diva-quest.git
cd dev-diva-quest/backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Setup with Gunicorn and Nginx
gunicorn --bind 0.0.0.0:8000 dev_diva_quest.wsgi:application
```

### Environment Configuration
Create `.env` file:
```env
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

## **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a Pull Request

## **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## **Acknowledgments**

- Built with ❤️ for women in tech
- Powered by modern web technologies
- AI integration by OpenAI
- Community-driven development

## **Contact**

- **Website**: [devgirlzz.com.uz](https://devgirlzz.com.uz)
- **Email**: hello@devgirlzz.com.uz
- **GitHub**: [@BafoyevaShakhrizoda](https://github.com/BafoyevaShakhrizoda)

---

**Empowering the next generation of female developers in IT! 💜**
