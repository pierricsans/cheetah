from server import main
from server import conf

app = main.create_app(conf.DevelopmentConfig())

if __name__ == "__main__":
    app.run()