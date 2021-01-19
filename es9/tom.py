#!/usr/bin/python3
import sys
import os
import pickle

def args2dict():
	dictionary = {}
	for arg in sys.argv[1:]:
		if arg in dictionary:
			dictionary[arg] = dictionary[arg] + 1
		else:
			dictionary[arg] = 1
	return dictionary

def load():
	myfile = open("/home/pi/tom/tom.pkl", "rb")
	dictionary = pickle.load(myfile)
	myfile.close()
	return dictionary

def save(mydict):
	myfile = open("/home/pi/tom/tom.pkl", "wb")
	pickle.dump(mydict, myfile)
	myfile.close()

def compare_dicts(saved_dict, args_dict):
	for name in args_dict:
		if name not in saved_dict:
			print_and_store(name, saved_dict)
		else:
			delta = args_dict[name] - saved_dict[name]
			if delta > 0:
				for i in range(delta):
					print_and_store(name, saved_dict)

def print_and_store(key, dictionary):
	print(key)
	if key in dictionary:
		dictionary[key] = dictionary[key] + 1
	else:
		dictionary[key] = 1

if __name__ == "__main__":
	args_dict = args2dict()
	
	# file is already created but is empty on first run
	# populate it with an empty dictionary if needed
	if os.stat('/home/pi/tom/tom.pkl').st_size == 0:
		empty_dict = {}
		save(empty_dict)

	saved_dict = load()
	
	compare_dicts(saved_dict, args_dict)
	save(saved_dict)
	
	exit(0)
