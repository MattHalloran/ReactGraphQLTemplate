# Combines plant json data from multiple sources
import json
import os


def combine():
    curr_dir = os.path.dirname(__file__)
    combined_data = []
    # Grab plant arrays
    with open(os.path.join(curr_dir, 'yards/output.txt'), 'rb') as infile:
        yards_data = json.load(infile)
    with open(os.path.join(curr_dir, 'plantnet/output.txt'), 'rb') as infile:
        plant_net_data = json.load(infile)
    print('TODO')


if __name__ == "__main__":
    combine()
