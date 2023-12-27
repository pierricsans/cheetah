# import sys
# import os

# ROOT_DIR = "/volume1/web"
# LOG_DIR = "/volume1/web/log"

# os.chdir(ROOT_DIR)
# sys.path.append(ROOT_DIR)

# import datetime
# import logging
# from pathlib import Path

# path = Path(LOG_DIR)
# path.mkdir(parents=True, exist_ok=True)
# ct = datetime.datetime.now()
# logging.basicConfig(
#     filename=os.path.join(
#         LOG_DIR,
#         f"{ct}.log".replace(":","-")
#     ), level=logging.DEBUG
# )

# logger = logging.getLogger()
# sys.stderr.write = logger.error
# sys.stdout.write = logger.info

from server import main
from server import conf

app = main.create_app(conf.ProductionConfig())

if __name__ == "__main__":
    app.run()
