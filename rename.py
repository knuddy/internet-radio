import uuid

import os


path = os.path.join(os.getcwd(), "music")
for filename in os.listdir(path):
    outfname = "%s.%s" % (str(uuid.uuid4()).replace('-', ''), filename.split('.')[-1])
    os.rename(os.path.join(path, filename), os.path.join(path, outfname))

